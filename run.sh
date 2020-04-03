count=0
pattern="((..[0-9]{1,2})(..:[0-9]{1,2})+)(..\s?-\s?|\)\s?)(.*)"
while read line ; do 
    # echo "$count $line"
    count=$((count + 1))
    [[ "$line" =~ $pattern ]]
    echo "${BASH_REMATCH[0]}"
done < list.txt