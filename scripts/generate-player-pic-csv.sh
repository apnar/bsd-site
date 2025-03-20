#!/bin/bash

(for i in public/playerpics/*jpg; do echo $i | sed 's#public/playerpics/\(....\)\(.*\)#"\1","https://www.bumpsetdrink.com/playerpics/\1\2"#'; done) > player-pics.csv
