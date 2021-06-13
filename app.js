//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo-list"
});

const item2 = new Item({
  name: "Hit + to add an item"
});

const item3 = new Item({
  name: "<-- hit this checkbox to delete an item"
});

const defautItems = [item1, item2, item3];

const listsSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("list",listsSchema);


app.get("/", function(req, res) {

  // const day = date.getDate();

  Item.find({}, function(err, foundItems) {
    //console.log(foundItems);

    if (foundItems.length === 0) {

      Item.insertMany(defautItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfuly saved to the database");
        };
      })
      res.redirect("/");

    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName=req.body.list;
  //console.log(listName);


  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      // console.log(foundList);
      foundList.items.push(item);
      // console.log(foundList);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});


app.get("/:customListName",function(req,res){
  //console.log(req.params.customListName);
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // console.log("doesnt exits");
        // doesnt exists create lists
        const list=new List({
          name:customListName,
          items:defautItems
        });
        list.save();
        res.redirect("/"+customListName);

      } else{
        // console.log("exists");
        // show an exiting list
        res.render("list",{
          listTitle:foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })




})


app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const checkedListName=req.body.listName;
  // console.log(checkedListName);

  if(checkedListName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("success");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name:checkedListName},{$pull:{items:{_id:checkedItemId}}},function(err,result){
      if(!err){
        //console.log(result);
        res.redirect("/"+checkedListName);
      }
    });
  }



})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
