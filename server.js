const express = require("express");
const app = express();
const mongoose = require('mongoose');
const _ = require ('lodash');

// const bodyParser = require('body-parser');

mongoose.connect("mongodb+srv://divyansh_gabra:6kGkgjrr2N9LPOGr@cluster0.h5vocpi.mongodb.net/toDoListDB");


const itemSchema = new mongoose.Schema({
    name :String
});

const Item = mongoose.model("Item", itemSchema);

const FirstItem = new Item({
    name : "Welcome to your To Do List!"
})
const SecondItem = new Item({
    name : "Hit the + button to add a new item."
})
const ThirdItem = new Item({
    name : "<-- Hit this to delete an item."
})

const defaultItems = [FirstItem,SecondItem,ThirdItem];

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
})
const List = new mongoose.model("List" ,listSchema);

app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));// can also use bodyParser
app.use(express.static("public"));

app.get("/",(req,res)=>{

    Item.find({}).then(function (item) {
        if (item.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully Inserted");
            }).catch(function (error) {
                console.log(error);
            })
            res.redirect("/");// this will redirect it back to root route and then the else statement will execute
        } else {
            res.render("list",{listTitle:"Today",newListItems:item});
        }
         
     }).catch(function (error) {
         console.log(error);
     })
     

});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({
        name : itemName
    });
    if (listName === "Today") {
        newItem.save().then(function () {
            res.redirect("/");  
        }).catch(function (error) {
            console.log(error);
        });
          
    }
    else{
        List.findOne({name : listName}).then(function(foundlist){
            foundlist.items.push(newItem);
            foundlist.save().then(function () {
                res.redirect('/' + listName);
             }).catch(function(error){
               console.log(error);
        })
    })
}   
}
    // Item.create(newItem).then(function () {
    //     // Just a callback
    // }).catch(function (error) {
    //    console.log(error); 
    // })    
);

app.post("/delete",function (req,res) {
    const checkedItemId = req.body.checkbox;
    const listName= req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId).then(function () {
            res.redirect("/");
        }).catch(function (error) {
            console.log(error);
        }) 
    }
    else{
       //Below we used mongoose findOneAndUpdate method along with MongoDB $pull property that can delete items from any array
        List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}}).then(function () {// here we are pulling items out of items array using their id
            res.redirect("/" + listName);
        }).catch(function (error) {
            console.log(error);
        })
    }

    
})



app.get("/:list",(req,res)=>{
    const list = _.capitalize(req.params.list);

  List.findOne({name:list}).then(function (foundlist) {
    if (!foundlist) {
        //Create a new list
        const newList = new List({
    name : list,
    items : defaultItems
})
  newList.save().then(function () {
     res.redirect('/' + list);
  }).catch(function(error){
    console.log(error);
  });
  // list.save(() => res.redirect('/' + customListName));
//   res.redirect("/" + list);
    }
    else{
        // Show the existing list
        res.render("list",{listTitle:foundlist.name, newListItems:foundlist.items})
        }
  }).catch(function (error) {
    console.log(error);
  })
  
})

app.post("/work",(req,res)=>{
    let item = req.body.newItem;
    const workItem = new Item({
        name : item
    });
    workItem.save();
    res.redirect("/work");
})

app.get("/about",(req,res)=>{
    res.render("about");
})










app.listen(3000,function () {
    console.log("Server is running on port 3000");
});