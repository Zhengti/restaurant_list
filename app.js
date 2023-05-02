const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const port = 3000
const restaurantsList = require('./restaurant.json')
// 設定mongoose連線
const mongoose = require('mongoose')
const Restaurant = require('./models/Restaurant')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// setting static files
app.use(express.static('public'))

// 主頁路由
app.get('/', (req, res) => {
  Restaurant.find()
    .lean()
    .then(restaurants => res.render('index', { restaurants }))
    .catch(error => console.error(error))
})

// 新增餐廳按鈕的路由
app.get('/restaurants/new', (req, res) => {
  return res.render('new')
})

//新增餐廳到資料庫的路由
app.post('/restaurants', (req, res) => {
  return Restaurant.create(req.body)
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// show(detail) 頁面的路由
app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('show', { restaurant }))
    .catch(err => console.log(err))
})

// 搜尋餐廳名稱、類別的路由
app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  // 取得/search 問號後面的關鍵字 console.log(req.query.keyword) 檢查是否取得
  const restaurants = restaurantsList.results.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(keyword.toLowerCase())
  })
  // 篩選餐廳名稱關鍵字
  const restaurantCategory = restaurantsList.results.filter(restaurant => {
    return restaurant.category.toLowerCase().includes(keyword.toLowerCase())
  })
  // 篩選餐廳類別關鍵字
  res.render('index', { restaurants: restaurants, keyword: keyword, restaurantCategory: restaurantCategory })
})

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})