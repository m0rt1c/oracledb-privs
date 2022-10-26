#!/usr/bin/env python
import matplotlib.pyplot as plt
import networkx as nx
import csv
import sys
import termios
import atexit
from enum import IntEnum

DBA_COL_PRIVS = "DBA_COL_PRIVS"
DBA_ROLE_PRIVS = "DBA_ROLE_PRIVS"
DBA_ROLES = "DBA_ROLES"
DBA_SYS_PRIVS = "DBA_SYS_PRIVS"
DBA_TAB_PRIVS = "DBA_TAB_PRIVS"
DBA_USERS = "DBA_USERS"
ROLE_TAB_PRIVS = "ROLE_TAB_PRIVS"

DB_TABLES = {
    DBA_COL_PRIVS:{
        "name": DBA_COL_PRIVS,
        "file": "DBA_COL_PRIVS.csv",
        "data": []
    },
    DBA_ROLE_PRIVS:{
        "name": DBA_ROLE_PRIVS,
        "file": "DBA_ROLE_PRIVS.csv",
        "data": []
    },
    DBA_ROLES:{
        "name": DBA_ROLES,
        "file": "DBA_ROLES.csv",
        "data": []
    },
    DBA_SYS_PRIVS:{
        "name": DBA_SYS_PRIVS,
        "file": "DBA_SYS_PRIVS.csv",
        "data": []
    },
    DBA_TAB_PRIVS:{
        "name": DBA_TAB_PRIVS,
        "file": "DBA_TAB_PRIVS.csv",
        "data": []
    },
    DBA_USERS:{
        "name": DBA_USERS,
        "file": "DBA_USERS.csv",
        "data": []
    },
    ROLE_TAB_PRIVS:{
        "name": ROLE_TAB_PRIVS,
        "file": "ROLE_TAB_PRIVS.csv",
        "data": []
    },
}

def enable_echo(enable):
    fd = sys.stdin.fileno()
    new = termios.tcgetattr(fd)
    if enable:
        new[3] |= termios.ECHO
    else:
        new[3] &= ~termios.ECHO

    termios.tcsetattr(fd, termios.TCSANOW, new)

def userNode(u):
    return u['username'], dict(color="Green", label="User")

def tabPrivNode(p):
    return p['privilege'], dict(color="Red", label="Priv")

def tabNodeFromTabPriv(p):
    return p['table_name'], dict(color="Orange", label="Table")

atexit.register(enable_echo, True)
enable_echo(False)

for table in DB_TABLES.values():
    f = open(table['file'])
    reader = csv.DictReader(f)
    for line in reader:
        table['data'].append(line)

users = DB_TABLES[DBA_USERS]
users_count = len(users['data'])-1

for user in users['data']:
    if user['account_status'] == "OPEN":
        g = nx.DiGraph()

        ulabel, uargs = userNode(user)
        g.add_node(ulabel, **uargs)

        for priv in DB_TABLES[DBA_TAB_PRIVS]['data']:
            if user['username'] == priv['grantee']:
                plabel, pargs = tabPrivNode(priv)
                g.add_node(plabel, **pargs)
                g.add_edge(ulabel, plabel)
                tlabel, targs = tabNodeFromTabPriv(priv)
                g.add_node(tlabel, **targs)
                g.add_edge(plabel, tlabel)

        base_options = dict(with_labels=True, edgecolors="black", node_size=500)
        node_colors = [d["color"] for _, d in g.nodes(data=True)]
        nx.draw_networkx(g, node_color=node_colors, **base_options)

        ax = plt.gca()
        ax.margins(0.20)
        plt.axis("off")
        plt.show()

        r = input(f"Continue? {users_count} users to go [y/n]\n")
        sys.stdout.write("\033[F")

        users_count -= 1

        if r.lower() == "n":
            break