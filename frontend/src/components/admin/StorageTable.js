import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StorageTable.css";

const StorageTable = () => {
  const [goods, setGoods] = useState([]);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await axios.get("/api/emergency-goods");
        setGoods(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGoods();
  }, []);

  return (
    <div className="section storage-table">
      <h2>Storage Table</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Goods</th>
            <th>Volume</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {goods
            .sort((a, b) => a.location.localeCompare(b.location))
            .map((good) => (
              <tr key={good._id}>
                <td>{good.category}</td>
                <td>{good.name}</td>
                <td>{good.volume}</td>
                <td>{good.location}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default StorageTable;
