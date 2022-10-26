const t_base = '/tables/'
const t_ext = '.csv'

const DBA_COL_PRIVS = "DBA_COL_PRIVS"
const DBA_ROLE_PRIVS = "DBA_ROLE_PRIVS"
const DBA_ROLES = "DBA_ROLES"
const DBA_SYS_PRIVS = "DBA_SYS_PRIVS"
const DBA_TAB_PRIVS = "DBA_TAB_PRIVS"
const DBA_USERS = "DBA_USERS"
const ROLE_TAB_PRIVS = "ROLE_TAB_PRIVS"

var tables = new Map()
var loaded = false

tables[DBA_COL_PRIVS] = new Map()
tables[DBA_ROLE_PRIVS] = new Map()
tables[DBA_SYS_PRIVS] = new Map()
tables[DBA_TAB_PRIVS] = new Map()
tables[ROLE_TAB_PRIVS] = new Map()
tables[DBA_ROLES] = new Map()
tables[DBA_USERS] = new Map()

window.addEventListener('hashchange', () => {
    handleHashChange()
}, false);

function fmt(s) {
    return `${t_base}${s}${t_ext}`
}

function handleHashChange() { }

async function init() {
    getUserPromise = fetch(fmt(DBA_USERS))
        .then(r => r.text())
        .then(text => console.log(text));
    
    getRolesPromise = fetch(fmt(DBA_ROLES))
        .then(r => r.text())
        .then(text => console.log(text));

    await Promise.all([
        getUserPromise,
        getRolesPromise
    ])
}

init()