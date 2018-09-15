const express = require("express")
const app = express()

app.get("*", express.static(__dirname))

app.listen(8003)