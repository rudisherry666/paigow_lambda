#!/bin/bash

curl https://4lsjp8j9ji.execute-api.us-west-2.amazonaws.com/test/register \
    --data "{\
        \"username\": \"rudi\",\
        \"password\": \"rudi\",\
        \"email\": \"rudisherry666@gmail.com\",\
        \"action\": \"register\"\
    }" \
    --header "sessionHash:" \

