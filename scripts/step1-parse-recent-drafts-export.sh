#!/bin/bash

# Download BSD\ Recent\ Drafts\ -\ HISTORY.csv from:
# https://docs.google.com/spreadsheets/d/1GHM_5dox0-vJHcXnu13aP8L2DAyVxWMnpd8ZvGpkJUY/edit?gid=218265882#gid=218265882

cat BSD\ Recent\ Drafts\ -\ HISTORY.csv | tail +4 | sed 's/\(,[^,]*\),.*,/\1,/' > draft.csv
