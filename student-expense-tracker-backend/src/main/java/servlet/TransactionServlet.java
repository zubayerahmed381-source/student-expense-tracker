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
import java.util.List;
import java.util.Map;

@WebServlet("/api/transactions")
public class TransactionServlet extends HttpServlet {

    private final TransactionDAO transactionDAO = new TransactionDAO();

    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
            .create();

    // =========================
    // ADD TRANSACTION
    // =========================

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            result.put("success", false);
            result.put("message", "Please login first.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        try {

            Long userId = (Long) session.getAttribute("userId");

            String description = request.getParameter("description");
            String amount = request.getParameter("amount");
            String category = request.getParameter("category");
            String transactionDate = request.getParameter("transactionDate");

            if (description == null || amount == null ||
                    category == null || transactionDate == null ||
                    description.isBlank() || amount.isBlank() ||
                    category.isBlank() || transactionDate.isBlank()) {

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

                result.put("success", false);
                result.put("message", "All transaction fields are required.");

                response.getWriter().write(gson.toJson(result));
                return;
            }

            Transaction transaction = new Transaction();

            transaction.setUserId(userId);
            transaction.setDescription(description);
            transaction.setAmount(new BigDecimal(amount));
            transaction.setCategory(category);
            transaction.setTransactionDate(
                    LocalDate.parse(transactionDate)
            );

            boolean success = transactionDAO.add(transaction);

            result.put("success", success);

            if (success) {
                result.put("message", "Transaction added successfully.");
            } else {
                result.put("message", "Failed to add transaction.");
            }

            response.getWriter().write(gson.toJson(result));

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            result.put("success", false);
            result.put("message", "Invalid transaction data.");

            response.getWriter().write(gson.toJson(result));
        }
    }

    // =========================
    // GET ALL TRANSACTIONS
    // =========================

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            result.put("success", false);
            result.put("message", "Please login first.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        Long userId = (Long) session.getAttribute("userId");

        List<Transaction> transactions =
                transactionDAO.findByUserId(userId);

        result.put("success", true);
        result.put("transactions", transactions);

        response.getWriter().write(gson.toJson(result));
    }

    // =========================
    // UPDATE TRANSACTION
    // =========================

    @Override
    protected void doPut(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            result.put("success", false);
            result.put("message", "Please login first.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        try {

            Long userId = (Long) session.getAttribute("userId");

            String idParameter = request.getParameter("id");
            String description = request.getParameter("description");
            String amount = request.getParameter("amount");
            String category = request.getParameter("category");
            String transactionDate = request.getParameter("transactionDate");

            if (idParameter == null || description == null ||
                    amount == null || category == null ||
                    transactionDate == null ||
                    idParameter.isBlank() ||
                    description.isBlank() ||
                    amount.isBlank() ||
                    category.isBlank() ||
                    transactionDate.isBlank()) {

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

                result.put("success", false);
                result.put("message", "All transaction fields are required.");

                response.getWriter().write(gson.toJson(result));
                return;
            }

            Transaction transaction = new Transaction();

            transaction.setId(Long.parseLong(idParameter));
            transaction.setUserId(userId);
            transaction.setDescription(description);
            transaction.setAmount(new BigDecimal(amount));
            transaction.setCategory(category);
            transaction.setTransactionDate(
                    LocalDate.parse(transactionDate)
            );

            boolean success = transactionDAO.update(transaction);

            result.put("success", success);

            if (success) {
                result.put("message", "Transaction updated successfully.");
            } else {
                result.put("message", "Transaction not found.");
            }

            response.getWriter().write(gson.toJson(result));

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            result.put("success", false);
            result.put("message", "Invalid transaction data.");

            response.getWriter().write(gson.toJson(result));
        }
    }

    // =========================
    // DELETE TRANSACTION
    // =========================

    @Override
    protected void doDelete(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            result.put("success", false);
            result.put("message", "Please login first.");

            response.getWriter().write(gson.toJson(result));
            return;
        }

        try {

            Long userId = (Long) session.getAttribute("userId");

            String idParameter = request.getParameter("id");

            if (idParameter == null || idParameter.isBlank()) {

                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);

                result.put("success", false);
                result.put("message", "Transaction ID is required.");

                response.getWriter().write(gson.toJson(result));
                return;
            }

            Long transactionId = Long.parseLong(idParameter);

            boolean success =
                    transactionDAO.delete(transactionId, userId);

            result.put("success", success);

            if (success) {
                result.put("message", "Transaction deleted successfully.");
            } else {
                result.put("message", "Transaction not found.");
            }

            response.getWriter().write(gson.toJson(result));

        } catch (Exception e) {

            e.printStackTrace();

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            result.put("success", false);
            result.put("message", "Invalid transaction ID.");

            response.getWriter().write(gson.toJson(result));
        }
    }
}