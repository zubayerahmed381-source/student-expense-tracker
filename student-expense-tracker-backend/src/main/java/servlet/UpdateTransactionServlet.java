package servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.TransactionDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.Transaction;
import util.LocalDateAdapter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/transactions/update")
public class UpdateTransactionServlet extends HttpServlet {

    private final TransactionDAO transactionDAO = new TransactionDAO();

    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(
                    LocalDate.class,
                    new LocalDateAdapter()
            )
            .create();

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session = request.getSession(false);

        if (session == null ||
                session.getAttribute("userId") == null) {

            result.put("success", false);
            result.put("message", "Please login first.");

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.getWriter().write(
                    gson.toJson(result)
            );

            return;
        }

        try {

            Long userId =
                    (Long) session.getAttribute("userId");

            String idParam =
                    request.getParameter("id");

            String description =
                    request.getParameter("description");

            String amountParam =
                    request.getParameter("amount");

            String category =
                    request.getParameter("category");

            String dateParam =
                    request.getParameter("transactionDate");

            if (idParam == null ||
                    description == null ||
                    amountParam == null ||
                    category == null ||
                    dateParam == null ||
                    idParam.isBlank() ||
                    description.isBlank() ||
                    amountParam.isBlank() ||
                    category.isBlank() ||
                    dateParam.isBlank()) {

                result.put("success", false);
                result.put(
                        "message",
                        "All transaction fields are required."
                );

                response.setStatus(
                        HttpServletResponse.SC_BAD_REQUEST
                );

                response.getWriter().write(
                        gson.toJson(result)
                );

                return;
            }

            Long id = Long.parseLong(idParam);

            BigDecimal amount =
                    new BigDecimal(amountParam);

            LocalDate transactionDate =
                    LocalDate.parse(dateParam);

            Transaction transaction =
                    new Transaction();

            transaction.setId(id);
            transaction.setUserId(userId);
            transaction.setDescription(description);
            transaction.setAmount(amount);
            transaction.setCategory(category);
            transaction.setTransactionDate(transactionDate);

            boolean success =
                    transactionDAO.update(transaction);

            result.put("success", success);

            if (success) {

                result.put(
                        "message",
                        "Transaction updated successfully."
                );

            } else {

                result.put(
                        "message",
                        "Transaction not found or update failed."
                );
            }

            response.getWriter().write(
                    gson.toJson(result)
            );

        } catch (NumberFormatException e) {

            result.put("success", false);
            result.put(
                    "message",
                    "Invalid transaction ID or amount."
            );

            response.setStatus(
                    HttpServletResponse.SC_BAD_REQUEST
            );

            response.getWriter().write(
                    gson.toJson(result)
            );

        } catch (Exception e) {

            result.put("success", false);
            result.put(
                    "message",
                    "Update failed: " + e.getMessage()
            );

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().write(
                    gson.toJson(result)
            );
        }
    }
}