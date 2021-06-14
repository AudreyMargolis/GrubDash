const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function isValidDish (req, res, next) {
    const { data: { name, description, price, image_url } = {} } = req.body;
  if (name && description && price && price >= 0 && image_url) {
    return next();
  }
  let missing;
  if(!name)
    missing = "name";
  else if(!description)
    missing = "description";
  else if(!price || price < 0 )
    missing = "price";
  else if(!image_url)
    missing = "image_url"
  next({ status: 400, message: `A valid '${missing}' property is required.` });
}

function create (req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id : nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function dishExists (req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id not found: ${req.params.dishId}`,
    });
}

function read (req, res) {
    const dish = res.locals.dish;
    res.status(200).json({ data: dish})
}
function list (req, res) {
    res.json({ data: dishes});
}
function update (req, res, next) {
  const dishId = req.params.dishId;
  let foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  
  if(id && id !== foundDish.id) 
    return next({
        status: 400,
        message: `Dish id "${id}" doesn't match: ${req.params.dishId}`,
      });
  if(typeof(price) !== "number")
      return next({ status: 400, message: `A valid 'price' property is required.` })

  foundDish = { ...foundDish, name, description, price, image_url }

  res.json({ data: foundDish });
}
module.exports = {
    list,
    read : [dishExists, read],
    create : [isValidDish, create],
    update : [dishExists, isValidDish, update]
  };