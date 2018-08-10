#!/bin/bash

kubectl patch deployment tanajura --type=json -n carlos -p '[{
  "op":"replace",
  "path":"/spec/template/spec/containers/0/image",
  "value":"formicarium/tanajura:1.5.0"
}]'