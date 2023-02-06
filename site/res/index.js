const t_base = '/tables/'
const t_ext = '.csv'


const DBA_ROLES = "DBA_ROLES"
const DBA_USERS = "DBA_USERS"

const DBA_COL_PRIVS = "DBA_COL_PRIVS"
const DBA_SYS_PRIVS = "DBA_SYS_PRIVS"
const DBA_TAB_PRIVS = "DBA_TAB_PRIVS"
const DBA_ROLE_PRIVS = "DBA_ROLE_PRIVS"

const ROLE_SYS_PRIVS = "ROLE_SYS_PRIVS"
const ROLE_TAB_PRIVS = "ROLE_TAB_PRIVS"

// TODO: Maybe use a function that maps the callbacks instead of a map item
const CBK = `__cbk__${(Math.random() + 1).toString(36).substring(2)}`

// state
var ucrt = 1
var tables = new Map()

var uname = document.getElementById('uname')
var uid = document.getElementById('uid')
var utot = document.getElementById('utot')
var scrollbox = document.getElementById('scroll')
var ufilter = document.getElementById('unamefilter')
var scrollbox = document.getElementById('scroll')
var ufilter = document.getElementById('unamefilter')
var cy = null

async function filterUsernames() {
    var re = RegExp(".*")
    if (ufilter.value != "") {
        re = RegExp(ufilter.value, 'i')
    }
    for (var i = 0; i < scrollbox.children.length; i++) {
        n = scrollbox.children[i]
        if (re.exec(n.innerText)) {
            n.classList.add("visible")
            n.classList.remove("hidden")
        } else {
            n.classList.add("hidden")
            n.classList.remove("visible")
        }
    }
}

async function toggleEntity(e) {
    cy.filter(`node[type = "${e}"]`).nodes().forEach(n => {
        if (n.visible()) {
            n.hide()
        } else {
            n.show()
        }
    })
}

async function updateLayout(v) {
    var layout = cy.elements().not(':hidden').layout({
        name: v,
        fit: false,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        directed: true
    })
    layout.run()
    cy.center()
}

// Parse tables as map of user -> [list of privileges]
function parseDBA_TABLESMapOfArray(text) {
    var tmp = new Map()
    text.split('\n').slice(1).forEach((line) => {
        args = line.split(',')
        grantee = args[0]
        if (!tmp.has(grantee)) {
            tmp.set(grantee, [])
        }
        tmp.get(grantee).push(args)
    })
    var out = []
    tmp.forEach((val, key) => {
        out.push([key, val])
    })
    return out
}

// Parse tables as map of user -> data
function parseDBA_TABLESimple(text) {
    var out = []
    text.split('\n').slice(1).forEach((line) => {
        args = line.split(',')
        out.push([args[0], args])
    })
    return out
}

// format table url
function fmt(s) {
    return `${t_base}${s}${t_ext}`
}

function userNode(u) {
    return { data: { id: u, label: `U:${u}`, color: '#008000', shape: 'diamond', type: 'u' } }
}

function userPrivNode(u) {
    return { data: { id: u, label: `P:${u}`, color: '#ff0000', shape: 'star', type: 'p' } }
}

function tableNode(u) {
    return { data: { id: u, label: `T:${u}`, color: '#ffa500', shape: 'rectangle', type: 't' } }
}

function columnNode(u) {
    return { data: { id: u, label: `C:${u}`, color: '#ffff00', shape: 'round-rectangle', type: 'c' } }
}

function roleNode(u) {
    return { data: { id: u, label: `R:${u}`, color: '#800080', shape: 'triangle', type: 'r' } }
}

function relEdge(a, b) {
    return { data: { id: `${a}->${b}`, source: a, target: b } }
}

function addNodesFromDBA_COL_PRIVS(u, e) {
    if (tables.get(DBA_COL_PRIVS).has(u)) {
        tables.get(DBA_COL_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            table_name = val[2]
            column_name = val[3]
            priv = val[5]

            e.push(tableNode(table_name))
            e.push(columnNode(column_name))
            e.push(userPrivNode(priv))

            e.push(relEdge(grantee, priv))
            e.push(relEdge(priv, table_name))
            e.push(relEdge(table_name, column_name))
        })
    }
}

function addNodesFromROLE_SYS_PRIVS(u, e) {
    if (tables.get(ROLE_SYS_PRIVS).has(role)) {
        tables.get(ROLE_SYS_PRIVS).get(role).forEach(val => {
            role = val[0]
            priv = val[1]

            e.push(userPrivNode(priv))
            e.push(relEdge(role, priv))
        })
    }
}

function addNodesFromDBA_ROLE_PRIVS(u, e) {
    if (tables.get(DBA_ROLE_PRIVS).has(u)) {
        tables.get(DBA_ROLE_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            role = val[1]

            e.push(roleNode(role))
            e.push(relEdge(grantee, role))


            addNodesFromROLE_SYS_PRIVS(role, e)
            addNodesFromDBA_COL_PRIVS(role, e)
            addNodesFromDBA_SYS_PRIVS(role, e)
            addNodesFromDBA_TAB_PRIVS(role, e)
        })
    }
}

function addNodesFromDBA_SYS_PRIVS(u, e) {
    if (tables.get(DBA_SYS_PRIVS).has(u)) {
        tables.get(DBA_SYS_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            priv = val[1]

            e.push(userPrivNode(priv))
            e.push(relEdge(grantee, priv))
        })
    }
}

function addNodesFromDBA_TAB_PRIVS(u, e) {
    if (tables.get(DBA_TAB_PRIVS).has(u)) {
        tables.get(DBA_TAB_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            table_name = val[2]
            priv = val[4]

            e.push(tableNode(table_name))
            e.push(userPrivNode(priv))

            e.push(relEdge(grantee, priv))
            e.push(relEdge(priv, table_name))
        })
    }
}

function addNodesFromROLE_TAB_PRIVS(u, e) {
    if (tables.get(ROLE_TAB_PRIVS).has(u)) {
        tables.get(ROLE_TAB_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            table_name = val[2]
            column_name = val[3]
            priv = val[4]

            e.push(tableNode(table_name))
            e.push(columnNode(column_name))
            e.push(userPrivNode(priv))

            e.push(relEdge(grantee, priv))
            e.push(relEdge(priv, table_name))
            e.push(relEdge(table_name, column_name))
        })
    }
}

function updateNetwork(u) {
    document.querySelectorAll('input[type=checkbox]').forEach(c => { c.checked = false })

    var e = [userNode(u)]

    addNodesFromDBA_COL_PRIVS(u, e)
    addNodesFromDBA_ROLE_PRIVS(u, e)
    addNodesFromDBA_SYS_PRIVS(u, e)
    addNodesFromDBA_TAB_PRIVS(u, e)
    addNodesFromROLE_TAB_PRIVS(u, e)

    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: e,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'shape': 'data(shape)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
        ],
        layout: {
            name: 'breadthfirst',
            fit: false,
            avoidOverlap: true,
            nodeDimensionsIncludeLabels: true,
            directed: true
        }
    });
}

function setUser(x) {
    var user = tables.get(DBA_USERS).get(x)
    uname.innerText = user[0]
    uid.innerText = user[1]

    updateNetwork(user[0])
}

function update() {
    var first = true
    tables.get(DBA_USERS).forEach((val) => {
        if (typeof val != "object") { return }
        if (val[0] == "") { return }
        // if (val[3] != "OPEN") { return }

        let e = document.createElement('button')
        e.innerText = val[0]

        if (tables.get(DBA_ROLE_PRIVS).has(val[0])) {
            for (i in tables.get(DBA_ROLE_PRIVS).get(val[0])) { 
                if ("DBA" === tables.get(DBA_ROLE_PRIVS).get(val[0])[i][1]) {
                    tag = document.createElement("b")
                    tag.classList.add("role-tag")
                    tag.innerText = "DBA"
                    e.appendChild(tag)
                    break
                }
            }
        }
        
        if (tables.get(DBA_ROLE_PRIVS).has(val[0])) {
            for (i in tables.get(DBA_ROLE_PRIVS).get(val[0])) { 
                if ("SCHEDULER_ADMIN" === tables.get(DBA_ROLE_PRIVS).get(val[0])[i][1]) {
                    tag = document.createElement("b")
                    tag.classList.add("role-tag")
                    tag.innerText = "SCHEDULER_ADMIN"
                    e.appendChild(tag)
                    break
                }
            }
        }
        
        if (tables.get(DBA_ROLE_PRIVS).has(val[0])) {
            for (i in tables.get(DBA_SYS_PRIVS).get(val[0])) { 
                if ("\"CREATE ANY DIRECTORY\"" === tables.get(DBA_SYS_PRIVS).get(val[0])[i][1]) {
                    tag = document.createElement("b")
                    tag.classList.add("perm-tag")
                    tag.innerText = "CREATE ANY DIRECTORY"
                    e.appendChild(tag)
                    break
                }
            }
        }

        e.onclick = function () {
            setUser(val[0])
        }
        scrollbox.appendChild(e)

        if (first) {
            first = false
            setUser(val[0])
        }
    })
}

async function init() {
    tables.set(DBA_COL_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(DBA_ROLE_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(DBA_SYS_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(DBA_TAB_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(ROLE_SYS_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(ROLE_TAB_PRIVS, new Map(
        [[CBK, parseDBA_TABLESMapOfArray]]
    ))

    tables.set(DBA_ROLES, new Map(
        [[CBK, parseDBA_TABLESimple]]
    ))
    
    tables.set(DBA_USERS, new Map(
        [[CBK, parseDBA_TABLESimple]]
    ))

    var promises = []
    // fetch all tables CSV from the server and 
    // initializes the maps with the callaback function
    tables.forEach((t_data, t_name) => {
        if (!t_data.has(CBK)) { return }

        p = fetch(fmt(t_name))
            .then(r => r.text())
            .then(text => {
                t_data.get(CBK)(text).forEach(e => {
                    t_data.set(e[0], e[1])
                })
            });
        promises.push(p)
    })

    await Promise.all(promises)

    utot.innerText = tables.get(DBA_USERS).size - 2
    tables.set(DBA_USERS, new Map([...tables.get(DBA_USERS).entries()].sort()))

    document.getElementById('loader').classList.add('hidden')
    document.getElementById('content').classList.remove('hidden')

    update()
}

init()