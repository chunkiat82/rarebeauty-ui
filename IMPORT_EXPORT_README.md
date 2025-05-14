cbexport json \
  -c couchbase://localhost \
  -u rarebeauty \
  -p 'soho!@#$' \
  -b appointments \
  -o /tmp/rarebeauty_export.json \
  -f lines \
  --include-data rarebeauty.default \
  --scope-field scope \
  --collection-field collection \
  --include-key doc_key


  cbimport json \
  -c couchbase://localhost \
  -u rarebeauty \
  -p 'soho!@#$' \
  -b appointments_dev \
  -d file:///tmp/rarebeauty_export.json \
  -f lines \
  --scope-collection-exp \
  --generate-key %doc_key% \
  --ignore-fields doc_key,scope,collection