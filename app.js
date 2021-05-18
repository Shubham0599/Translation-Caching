const express = require('express');

const bodyParser = require('body-parser')
const translate = require('@vitalets/google-translate-api');
const redis = require('redis');

const app = express();

//  templating engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

//  port and redis client
const port = process.env.PORT || 3000;
const redis_port = process.env.PORT||6379;
const client = redis.createClient(redis_port);

//  use of google translate api in fromapi function
function fromapi(req,res,next) {
    const { speech,language } = req.body;
    console.log( speech + " " + language );
      translate(speech, {to:language}).then(response => {
      console.log(response.text);
      const feeddata = req.body.speech + req.body.language;
      client.setex(feeddata,3600,response.text);
        res.render('index', {initial_data: speech, option: language, final_data: response.text });
    }).catch(err => {
    console.error(err);
    })
}

//  cache middleware (taking data from cache)
function cache(req, res, next){
    const {speech,language}=req.body;
    const feeddata=req.body.speech+req.body.language;

    client.get(feeddata,(err,data)=>{
        if(err)throw err;
        if(data!=null){
            console.log("data "+data);
            console.log("inside caching...")
            res.render('index', { initial_data :speech, option: language, final_data: data });
        }else{
            next();
        }
    })
}

// Routes
app.get('/', (req, res) => {
  res.render('index', {initial_data: '', option: '', final_data: '' });
});

app.post('/translate', cache, fromapi);

//  Listening port


module.exports=app.listen(port, () => {
    console.log('Port running at '+ port);
  });;
