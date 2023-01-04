import { Dispatch, SetStateAction } from "react";
import TicketItem from "./TicketItem";
import ticketModel from "../../../models/ticketModel";
import { Button } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const TicketList = ({
  newTickets,
  setNewTickets,
}: {
  newTickets: ticketModel[];
  setNewTickets: Dispatch<SetStateAction<ticketModel[]>>;
}) => {
  const deleteTicket = (id: string | undefined) => {
    const updatedNewTickets = newTickets.filter((ticket) => ticket.id !== id);
    setNewTickets(updatedNewTickets);
  };

  return (
    <div>
      {newTickets.length === 0 && <p>Please select a ticket</p>}
      {newTickets.length === 1 && <h4>{newTickets.length} ticket</h4>}
      {newTickets.length > 1 && <h4>{newTickets.length} tickets</h4>}

      {newTickets.length > 0 &&
        newTickets.map((ticket: ticketModel) => (
          <div
            key={ticket.id}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <TicketItem ticket={ticket} />
            <Button
              type="button"
              startIcon={<DeleteForeverIcon />}
              style={{ color: "var(--dark-purple)" }}
              onClick={() => {
                deleteTicket(ticket.id);
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default TicketList;
