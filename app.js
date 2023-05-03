const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const port = 3000
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

// 前往edit頁面的路由
app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch(err => console.log(err))
})

// findByIdAndUpdate在 Mongoose 6.0 版本中將被移除，以下設定是為了不產生警告，但findByIdAndUpdate不知道是否還會支援。
mongoose.set('useFindAndModify', false)

// edit 將修改後的資料傳給資料庫的路由
app.post('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  Restaurant.findByIdAndUpdate(id, req.body)
    .then(() => res.redirect(`/restaurants/${id}`))
    .catch(err => console.log(err))
})

// delete 刪除資料的路由
app.post('/restaurants/:id/delete', (req, res) => {
  const id = req.params.id
  Restaurant.findById(id)
    .then(restaurant => restaurant.remove())
    .then(() => res.redirect('/'))
    .catch(err => console.log(err))
})

// 搜尋餐廳名稱、類別的路由
app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  const keywords = req.query.keyword.trim().toLowerCase()
  // 取得/search 問號後面的關鍵字 console.log(req.query.keyword) 檢查是否取得
  Restaurant.find()
    .lean()
    .then(restaurant => {
      const filterRestaurant = restaurant.filter(
        data =>
          data.name.toLowerCase().includes(keywords) ||
          data.category.includes(keywords)
      )
      res.render('index', { restaurants: filterRestaurant, keywords })
    })
    .catch(err => console.log(err))
})

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})