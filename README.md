# Oracle DB Privileges Visualizer

A tool to visualize the permissions granted to Oracle database users, helping system admin and security auditor identify accounts that may have too broad permissions.

## Deploy

1. Obtain the database tables 

Obtain the tables below, inside file `tables.txt` too, from the database and save them in `./site/tables/` as CSV files with the following naming convention `TABLE_NAME.csv`.

```
DBA_ROLES
DBA_USERS
DBA_COL_PRIVS
DBA_SYS_PRIVS
DBA_TAB_PRIVS
DBA_ROLE_PRIVS
ROLE_SYS_PRIVS
ROLE_TAB_PRIVS
```

A utility script, named `pulltables.sh` is included in this repo. It will load credentials and targets from a file named `.env` and use [usql](https://github.com/xo/usql) to download the database tables.

2. Start the web server

Server the files inside the `./site` directory to access the web page, simply opening the web page in the browser will not do unless you modify the code.

A sample web server written in go can be started with:

```bash
go run main.go
```

As an alternative you can start a simple python server:

```bash
python -m http.server 9090 --directory ./site
```