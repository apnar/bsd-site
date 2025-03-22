#!/bin/bash

cat BSD\ Recent\ Drafts\ -\ HISTORY.csv | tail +4 | sed 's/\(,[^,]*\),.*,/\1,/' > draft.csv
