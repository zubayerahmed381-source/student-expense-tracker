
package servlet;

import com.google.gson.Gson;
import dao.TransactionDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import util.DBConnection;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/transactions/clear")
public class ClearTransactionsServlet extends HttpServlet {

    private final TransactionDAO transactionDAO =
            new TransactionDAO();

    private final Gson gson = new Gson();

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

            String sql =
                    "DELETE FROM transactions WHERE user_id = ?";

            try (Connection conn =
                         DBConnection.getConnection();
                 PreparedStatement stmt =
                         conn.prepareStatement(sql)) {

                stmt.setLong(1, userId);

                int deletedRows =
                        stmt.executeUpdate();

                result.put("success", true);
                result.put(
                        "message",
                        "All transactions cleared successfully."
                );
                result.put(
                        "deletedCount",
                        deletedRows
                );
            }

            response.getWriter().write(
                    gson.toJson(result)
            );

        } catch (Exception e) {

            result.put("success", false);
            result.put(
                    "message",
                    "Failed to clear transactions: "
                            + e.getMessage()
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