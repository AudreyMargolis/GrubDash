const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function validOrder (req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if ( deliverTo && mobileNumber && Array.isArray(dishes) && dishes.length > 0) {
    if(dishes.every(dish => Number.isInteger(dish.quantity)) && dishes.every(dish => dish.quantity > 0)){
        return next();
    }
  }
  let missing;
  if(!deliverTo)
    missing = "deliverTo";
  else if(!mobileNumber)
    missing = "mobileNumber";
  else if(!dishes)
    missing = "dishes";
  else if(!Array.isArray(dishes))
    missing  = "dishes array"
  else if(dishes.length === 0)
    missing = "dishes with more than 0"
  else if(dishes.some(dish => dish.quantity === 0))
    missing = "dish with quantity above 0"
  else if(dishes.some(dish => isNaN(dish.quantity)))
    missing = "dish with quantity of atleast 1 or 2"
  else if(!dishes.every(dish => dish.quantity === undefined))
    missing = "dish with quantity of atleast 1 or 2"
  
  next({ status: 400, message: `A valid '${missing}' property is required.` });
}
function validStatus (req, res, next) {
  const { data: { status } = {} } = req.body;
  if ( status && status.length > 0 && status != "invalid") {
        return next();
  } 
  next({ status: 400, message: `A valid 'status' property is required.` });
}
function create (req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
        id : nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}
function update (req, res, next) {
  const orderId = req.params.orderId;
  let foundOrder = orders.find((order) => order.id === orderId);
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
  if(id && id !== foundOrder.id) 
    return next({
        status: 400,
        message: `Order id "${id}" doesn't match: ${req.params.orderId}`,
      });
  foundOrder = { ...foundOrder, deliverTo, mobileNumber, status, dishes }

  res.json({ data: foundOrder });
}
function orderExists (req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  res.locals.orderId = orderId;
  res.locals.order = foundOrder;
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}
function read (req, res) {
  const order = res.locals.order;
  res.status(200).json({ data: order})
}
function list (req, res) {
  res.json({ data: orders});
}
function destroy (req, res) {
  const index = orders.findIndex((order) => order.id === res.locals.orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}
function orderPending (req, res, next) {
  if (res.locals.order.status !== 'pending') {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  }
  next();
}
module.exports = {
    create: [validOrder, create],
    update: [orderExists, validOrder, validStatus, update],
    read: [orderExists, read],
    delete: [orderExists, orderPending, destroy],
    list
};