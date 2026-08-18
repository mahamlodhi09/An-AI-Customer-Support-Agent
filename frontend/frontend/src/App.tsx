import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Refunds from "./pages/Refunds";
import SupportTickets from "./pages/SupportTickets";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/support-tickets" element={<SupportTickets />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}