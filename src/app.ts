import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Car, Customer, Order } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();
const PORT = 3000;
app.use(express.json());


app.post("/car", async (req: Request, res: Response) => {
  const { make, model, year, customerId } = req.body;


  const car = await prisma.car.create({
    data: {
      make: make,
      model: model,
      year: year,
      customerId: customerId,
    },
  });
  res.json(car);
});


app.post("/customer", async (req: Request, res: Response) => {
  const { name, email, phoneNumber } = req.body;


  const customer = await prisma.customer.create({
    data: {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
    },
  });
  res.json(customer);
});


app.post("/rent", async (req: Request, res: Response) => {
  const { carId, customerId, startDate, endDate } = req.body;


  const car = await prisma.car.findUnique({

    where: { id: carId },
    include: { orders: true },
  });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }
  if (car.orders.some((order) => order.status === "RENTED")) {
    return res.status(400).json({ message: "Car is not available" });
  }


  const order = await prisma.order.create({
    data: {
      carId: car.id,
      customerId: customerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "RENTED",
    },
  });
  res.json(order);
});


app.post("/return", async (req: Request, res: Response) => {
  const { carId, customerId, endDate } = req.body;


  const order = await prisma.order.findFirst({
    where: {
      carId: carId,
      customerId: customerId,
      status: "RENTED",
    },
  });
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      endDate: new Date(endDate),
      status: "RETURNED",
    },
  });
  res.json(updatedOrder);
});


app.put("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phoneNumber } = req.body;


  const updatedCustomer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
    },
  });
  res.json(updatedCustomer);
});
app.get("/customers", async (req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    include: { cars: true, orders: true },
  });
  res.json(customers);
});


app.delete("/car/:id", async (req: Request, res: Response) => {
  const { id } = req.params;


  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
  });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }


  await prisma.car.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "Car deleted successfully" });
});

app.put("/car/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { make, model, year, customerId } = req.body;

  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
  });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }


  const updatedCar = await prisma.car.update({
    where: { id: Number(id) },
    data: {
      make: make,
      model: model,
      year: year,
      customerId: customerId,
    },
  });
  res.json(updatedCar);
});


app.delete("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;


  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }


  await prisma.customer.delete({
    where: { id: Number(id) },
  });
  res.json({ message: "Customer deleted successfully" });
});


app.put("/customer/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phoneNumber } = req.body;


  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
    },
  });
  res.json(updatedCustomer);
});


app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
