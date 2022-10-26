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

const CBK = `__cbk__${(Math.random() + 1).toString(36).substring(2)}`

// state
var ucrt = 1
var tables = new Map()
var loaded = false

var uname = document.getElementById('uname')
var uid = document.getElementById('uid')
var utot = document.getElementById('utot')
var scrollbox = document.getElementById('scroll')

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

function parseDBA_TABLESimple(text) {
    var out = []
    text.split('\n').slice(1).forEach((line) => {
        args = line.split(',')
        out.push([args[0], args])
    })
    return out
}

tables.set(DBA_ROLES, new Map(
    [[CBK, parseDBA_TABLESimple]]
))

tables.set(DBA_USERS, new Map(
    [[CBK, parseDBA_TABLESimple]]
))

window.addEventListener('hashchange', () => {
    handleHashChange()
}, false);

function fmt(s) {
    return `${t_base}${s}${t_ext}`
}

function handleHashChange() {
    if (!loaded) {
        setTimeout(handleHashChange, 5000)
    } else {
        update()
    }
}

function userNode(u) {
    return { data: { id: u, label: `U:${u}`, color: '#008000' } }
}

function userPrivNode(u) {
    return { data: { id: u, label: `P:${u}`, color: '#ff0000' } }
}

function tableNode(u) {
    return { data: { id: u, label: `T:${u}`, color: '#ffa500' } }
}

function columnNode(u) {
    return { data: { id: u, label: `C:${u}`, color: '#ffff00' } }
}

function roleNode(u) {
    return { data: { id: u, label: `R:${u}`, color: '#800080' } }
}

function relEdge(a, b) {
    return { data: { id: `${a}->${b}`, source: a, target: b } }
}

function updateNetwork(u) {
    var e = [userNode(u)]

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

    if (tables.get(DBA_ROLE_PRIVS).has(u)) {
        tables.get(DBA_ROLE_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            role = val[1]

            e.push(roleNode(role))
            e.push(relEdge(grantee, role))

            if (tables.get(ROLE_SYS_PRIVS).has(role)) {
                tables.get(ROLE_SYS_PRIVS).get(role).forEach(val => {
                    role = val[0]
                    priv = val[1]

                    e.push(userPrivNode(priv))
                    e.push(relEdge(role, priv))
                })
            }
        })
    }

    if (tables.get(DBA_SYS_PRIVS).has(u)) {
        tables.get(DBA_SYS_PRIVS).get(u).forEach(val => {
            grantee = val[0]
            priv = val[1]

            e.push(userPrivNode(priv))
            e.push(relEdge(grantee, priv))
        })
    }

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

    cytoscape({
        container: document.getElementById('cy'),
        elements: e,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)'
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
            name: 'breadthfirst'
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
    var promises = []

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

    loaded = true
    utot.innerText = tables.get(DBA_USERS).size - 2

    tables.set(DBA_USERS, new Map([...tables.get(DBA_USERS).entries()].sort()))
    update()
}

init()