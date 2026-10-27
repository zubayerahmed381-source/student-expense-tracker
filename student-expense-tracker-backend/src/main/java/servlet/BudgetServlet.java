
package servlet;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import dao.BudgetDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.Budget;
import util.LocalDateAdapter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/budget")
public class BudgetServlet extends HttpServlet {

    private final BudgetDAO budgetDAO = new BudgetDAO();

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
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(gson.toJson(result));
            return;
        }

        try {
            Long userId = (Long) session.getAttribute("userId");

            String monthParam = request.getParameter("budgetMonth");
            String amountParam = request.getParameter("amount");
            String category = request.getParameter("category");

            if (monthParam == null || monthParam.isBlank()
                    || amountParam == null || amountParam.isBlank()
                    || category == null || category.isBlank()) {

                result.put("success", false);
                result.put("message",
                        "Budget month, amount and category are required.");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(result));
                return;
            }

            LocalDate month = LocalDate.parse(monthParam)
                    .withDayOfMonth(1);

            BigDecimal amount = new BigDecimal(amountParam);

            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                result.put("success", false);
                result.put("message", "Budget cannot be negative.");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(result));
                return;
            }

            Budget budget = new Budget();
            budget.setUserId(userId);
            budget.setBudgetMonth(month);
            budget.setAmount(amount);
            budget.setCategory(category.trim());

            boolean success = budgetDAO.save(budget);

            result.put("success", success);
            result.put("message", success
                    ? "Category budget saved successfully."
                    : "Failed to save category budget.");

            if (!success) {
                response.setStatus(
                        HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }

            response.getWriter().write(gson.toJson(result));

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Failed to save budget.");
            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(result));
        }
    }

    @Override
    protected void doGet(
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
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(gson.toJson(result));
            return;
        }

        try {
            Long userId = (Long) session.getAttribute("userId");
            String monthParam = request.getParameter("month");
            String category = request.getParameter("category");

            if (monthParam == null || monthParam.isBlank()
                    || category == null || category.isBlank()) {
                result.put("success", false);
                result.put("message",
                        "Month and category are required.");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(gson.toJson(result));
                return;
            }

            LocalDate month = LocalDate.parse(monthParam)
                    .withDayOfMonth(1);

            Budget budget =
                    budgetDAO.findByUserMonthAndCategory(
                            userId,
                            java.sql.Date.valueOf(month),
                            category.trim()
                    );

            result.put("success", true);
            result.put("budget", budget);

            if (budget == null) {
                result.put("message",
                        "No budget found for this category and month.");
            }

            response.getWriter().write(gson.toJson(result));

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Failed to retrieve budget.");
            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(gson.toJson(result));
        }
    }
}
