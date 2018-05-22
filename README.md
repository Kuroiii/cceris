# CCEris



### Client.js


#### new Client(token, CCoptions, botOptions) 

Custom client




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| token | `string`  | - The bot's oauth token | &nbsp; |
| CCoptions | `Object`  | - The commandClient options | &nbsp; |
| botOptions | `Object`  | - The customClient options | &nbsp; |




##### Returns


- `Client`



#### login() 

Establish the connection to discord's API






##### Returns


- `Object`  data - The bot's data



#### log(message, prefix) 

Custom client logger




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| message | `string`  | - The message to be sent | &nbsp; |
| prefix | `string`  | - The message's prefix | &nbsp; |




##### Returns


- `string`  message



#### logError(message) 

Custom client error logger




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| message | `string`  | - The error message to be sent to the console | &nbsp; |




##### Returns


- `string`  message



[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

