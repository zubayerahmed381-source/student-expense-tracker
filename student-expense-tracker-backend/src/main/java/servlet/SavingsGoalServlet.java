package servlet;

import com.google.gson.Gson;
import dao.SavingsGoalDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.SavingsGoal;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/savings-goal")
public class SavingsGoalServlet extends HttpServlet {

    private final SavingsGoalDAO savingsGoalDAO =
            new SavingsGoalDAO();

    private final Gson gson = new Gson();

    // =========================
    // SAVE / UPDATE SAVINGS GOAL
    // =========================

    @Override
    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session =
                request.getSession(false);

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

            String goalParam =
                    request.getParameter("goalAmount");

            if (goalParam == null ||
                    goalParam.isBlank()) {

                result.put("success", false);
                result.put(
                        "message",
                        "Goal amount is required."
                );

                response.setStatus(
                        HttpServletResponse.SC_BAD_REQUEST
                );

                response.getWriter().write(
                        gson.toJson(result)
                );

                return;
            }

            BigDecimal goalAmount =
                    new BigDecimal(goalParam);

            if (goalAmount.compareTo(BigDecimal.ZERO) <= 0) {

                result.put("success", false);
                result.put(
                        "message",
                        "Goal amount must be greater than zero."
                );

                response.setStatus(
                        HttpServletResponse.SC_BAD_REQUEST
                );

                response.getWriter().write(
                        gson.toJson(result)
                );

                return;
            }

            SavingsGoal goal =
                    new SavingsGoal();

            goal.setUserId(userId);
            goal.setGoalAmount(goalAmount);

            boolean success =
                    savingsGoalDAO.save(goal);

            result.put("success", success);

            if (success) {

                result.put(
                        "message",
                        "Savings goal saved successfully."
                );

            } else {

                result.put(
                        "message",
                        "Failed to save savings goal."
                );
            }

            response.getWriter().write(
                    gson.toJson(result)
            );

        } catch (NumberFormatException e) {

            result.put("success", false);
            result.put(
                    "message",
                    "Invalid goal amount."
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
                    "Failed: " + e.getMessage()
            );

            response.setStatus(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR
            );

            response.getWriter().write(
                    gson.toJson(result)
            );
        }
    }

    // =========================
    // GET SAVINGS GOAL
    // =========================

    @Override
    protected void doGet(
            HttpServletRequest request,
            HttpServletResponse response)
            throws IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> result = new HashMap<>();

        HttpSession session =
                request.getSession(false);

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

            SavingsGoal goal =
                    savingsGoalDAO.findByUserId(userId);

            result.put("success", true);

            if (goal != null) {

                result.put("goal", goal);

            } else {

                result.put("goal", null);
                result.put(
                        "message",
                        "No savings goal found."
                );
            }

            response.getWriter().write(
                    gson.toJson(result)
            );

        } catch (Exception e) {

            result.put("success", false);
            result.put(
                    "message",
                    "Failed: " + e.getMessage()
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