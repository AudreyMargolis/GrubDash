const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed")
// TODO: Implement the /orders routes needed to make the tests pass
router
    .route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .post(controller.create)
    .delete(controller.delete)
    .all(methodNotAllowed)
router 
    .route("/")
    .get(controller.list)
    .delete(methodNotAllowed)
    .put(methodNotAllowed)
    .post(controller.create)
    .all(methodNotAllowed)
module.exports = router;
