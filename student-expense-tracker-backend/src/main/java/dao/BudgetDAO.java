
package dao;

import model.Budget;
import util.DBConnection;

import java.sql.*;

public class BudgetDAO {

    public boolean save(Budget budget) {

        String sql = """
                INSERT INTO budgets
                (user_id, budget_month, amount, category)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                amount = VALUES(amount)
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, budget.getUserId());
            stmt.setDate(2, Date.valueOf(
                    budget.getBudgetMonth().withDayOfMonth(1)
            ));
            stmt.setBigDecimal(3, budget.getAmount());
            stmt.setString(4, budget.getCategory());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public Budget findByUserMonthAndCategory(
            Long userId, Date month, String category) {

        String sql = """
                SELECT id, user_id, budget_month, amount, category
                FROM budgets
                WHERE user_id = ?
                  AND budget_month = ?
                  AND category = ?
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            stmt.setDate(2, month);
            stmt.setString(3, category);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Budget(
                            rs.getLong("id"),
                            rs.getLong("user_id"),
                            rs.getDate("budget_month").toLocalDate(),
                            rs.getBigDecimal("amount"),
                            rs.getString("category")
                    );
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return null;
    }
}
