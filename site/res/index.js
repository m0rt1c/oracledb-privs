const t_base = '/tables/'
const t_ext = '.csv'

const DBA_COL_PRIVS = "DBA_COL_PRIVS"
const DBA_ROLE_PRIVS = "DBA_ROLE_PRIVS"
const DBA_ROLES = "DBA_ROLES"
const DBA_SYS_PRIVS = "DBA_SYS_PRIVS"
const DBA_TAB_PRIVS = "DBA_TAB_PRIVS"
const DBA_USERS = "DBA_USERS"
const ROLE_TAB_PRIVS = "ROLE_TAB_PRIVS"
const CBK = `__cbk__${(Math.random() + 1).toString(36).substring(2)}`

var tables = new Map()
var loaded = false

tables.set(DBA_COL_PRIVS, new Map())
tables.set(DBA_ROLE_PRIVS, new Map())
tables.set(DBA_SYS_PRIVS, new Map())
tables.set(DBA_TAB_PRIVS, new Map())
tables.set(ROLE_TAB_PRIVS, new Map())
tables.set(DBA_ROLES, new Map())

function parseDBA_USERS(text) {
    var out = []
    text.split('\n').slice(1).forEach((line)=>{
        args = line.split(',')
        out.push([args[0],args])
    })
    return out
}

tables.set(DBA_USERS, new Map(
    [[CBK, parseDBA_USERS]]
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
        updateGraph()
    }
}

function updateGraph() { }

async function init() {
    var promises = []

    tables.forEach((t_data, t_name)=>{
        if (!t_data.has(CBK)) {return}

        p = fetch(fmt(t_name))
            .then(r => r.text())
            .then(text => {
                t_data.get(CBK)(text).forEach(e=>{
                    t_data.set(e[0], e[1])
                })
            });
        promises.push(p)
    })

    await Promise.all(promises)
    loaded = true
}

init()