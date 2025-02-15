import React from "react";

const MapTaskAccept = ({ tasks, rescuer, handleAcceptTask }) => {
  if (!rescuer) return null;

  // Filter out tasks that are already accepted
  const availableTasks = tasks.filter(
    (task) => !task.acceptedBy && task.issuedBy !== null
  );

  return (
    <div>
      <h3>Available Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Goods Category</th>
            <th>Goods</th>
            <th>Date Issued</th>
            <th>Date Accepted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {availableTasks.map((task, index) => (
            <tr key={task._id}>
              <td>{task.issuedBy?.username}</td>
              <td>{task.goodsCategory}</td>
              <td>{task.goods}</td>
              <td>{new Date(task.dateTimeIssued).toLocaleString()}</td>
              <td>
                {task.acceptedBy
                  ? rescuer._id === task.acceptedBy
                    ? "Accepted by you"
                    : "Accepted"
                  : "Not accepted yet"}
              </td>
              <td>
                <button
                  onClick={() => handleAcceptTask(task._id)}
                  disabled={task.acceptedBy || rescuer.activeTasks.length >= 4}
                >
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MapTaskAccept;
