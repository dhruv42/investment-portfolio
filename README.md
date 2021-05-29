# Investment Portfolio API Documentation

A portfolio tracking service lets you buy/sell securities, also update/remove the latest trade.


# REST APIS


## Add a trade  
You can perform a trade(buy/sell) of security using this API.

**Request:**
```json
POST /api/v1/trade HTTP/1.1
Content-Type: application/json

{
    "type": "buy / sell", //required
    "ticker": "REL", //required
    "quantity": 2, //required
    "price":50 //required
}
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "message": "Success"
}
```
**Failed Response:**
```json
HTTP/1.1 401 Unauthorized
Server: My RESTful API
Content-Type: application/json
Content-Length: xy

{
    "code": 120,
    "message": "invalid crendetials",
    "resolve": "The username or password is not correct."
}
``` 

## Update a trade  
You can only update latest trade of a security.
Only the parameter which needs to be updated should be included in the request, request body is same as `Add a trade`.

**Request:**
```json
PUT /api/v1/trade/:id HTTP/1.1
Content-Type: application/json

{
    "type": "buy / sell",
    "ticker": "REL",
    "quantity": 2,
    "price":50
}
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "message": "Success"
}
```

## Remove a trade  
You can only remove latest trade of a security, which bring back the security to it's previous state.

**Request:**
```json
DELETE /api/v1/trade/:id HTTP/1.1
```
**Successful Response:**
```json
HTTP/1.1 204 No Content
```


## Fetch Trades
Fetch all the securities and trades correspond to it.

**Request:**
```json
GET /api/v1/trades HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json
{
    "success": true,
    "error": false,
    "data":[
        {
            "_id": "REL",
            "trades": [
                {
                    "_id": "60b278d706f9763fe409ccc5",
                    "type": "buy",
                    "quantity": 2,
                    "price": 50,
                    "createdAt": "2021-05-29T17:24:39.494Z"
                }
            ]
        }
    ]
}
```

## Fetch Portfolio
It is an aggregate view of all securities in the portfolio with its final
quantity and average buy price

**Request:**
```json
GET /api/v1/portfolio HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "data": {
        "_id": "60b27763a81d573e17ebab18",
        "totalInvestment": 300,
        "securities": [
            {
                "ticker": "REL",
                "quantity": 4,
                "avgPrice": 75,
                "totalPrice": 300
            }
        ]
    }
}
```

## Fetch Returns
Returns is the profit earned through investment, below is the formula to calculate returns  
`(Current Price - Avg Price) * Quantity`  

This API returns sum of returns from all the securities

**Request:**
```json
GET /api/v1/returns HTTP/1.1
Content-Type: application/json
```
**Successful Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "success": true,
    "error": false,
    "data": 100
}
```