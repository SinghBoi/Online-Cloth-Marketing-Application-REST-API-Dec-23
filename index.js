import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productModel from "./schema.js";
import render from "ejs";

mongoose.connect("mongodb://127.0.0.1:27017/products");
const db = mongoose.connection;
db.on("error", console.error);
db.once("open", () => console.log("Mongodb connected successfully!"));

const app = express();
app.use(bodyParser.json());
app.set("view engine", "ejs")

app.get('/', async (req, resp) => {
    const products = await productModel.find();
    resp.render("Products", { products })
});

app.get("/api/products", async (req, resp) => {
    const products = await productModel.find();
    const searchProduct = req.query;
    if (searchProduct && searchProduct.name) {
        const keyword = searchProduct.name;
        const filteredProducts = products.filter((product) =>
            product.name.includes(keyword)
        );
        resp.json(filteredProducts);
    } else {
        resp.json(products);
    }
});

app.get("/api/products/:id", async (req, resp) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (product) {
            resp.json(product);
        } else {
            resp.status(404).end();
        }
    } catch (err) {
        resp.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/products", async (req, resp) => {
    try {
        const product = new productModel({
            ...req.body,
        });
        const savedProduct = await product.save();
        resp.status(201).json(savedProduct);
    } catch (err) {
        resp.status(400).end();
    }
});

app.put("/api/products/:id", async (req, resp) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (product) {
            if (req.body.name) {
                product.name = req.body.name;
            }
            if (req.body.description) {
                product.description = req.body.description;
            }
            if (req.body.price) {
                product.price = req.body.price;
            }
            if (req.body.quantity) {
                product.quantity = req.body.quantity;
            }
            if (req.body.category) {
                product.category = req.body.category;
            }
            const newProduct = await product.save();
            resp.status(200).json(newProduct);
        } else {
            resp.status(404).end();
        }
    } catch (err) {
        resp.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/api/products/:id", async (req, resp) => {
    try {
        await productModel.findOneAndDelete({ _id: req.params.id });
        resp.status(200).end();
    } catch (err) {
        console.error(err);
        resp.status(500).json({ message: "Internal server error" });
    }
});

app.delete("/api/products", async (req, resp) => {
    try {
        await productModel.deleteMany();
        resp.status(200).end();
    } catch (err) {
        console.error(err);
        resp.status(500).json({ message: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log("Server running at localhost:3000");
});