package dao;

import model.Transaction;
import util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TransactionDAO {

    public boolean add(Transaction transaction) {

        String sql = """
                INSERT INTO transactions
                (user_id, description, amount, category, transaction_date)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, transaction.getUserId());
            stmt.setString(2, transaction.getDescription());
            stmt.setBigDecimal(3, transaction.getAmount());
            stmt.setString(4, transaction.getCategory());
            stmt.setDate(5, Date.valueOf(transaction.getTransactionDate()));

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Transaction> findByUserId(Long userId) {

        List<Transaction> transactions = new ArrayList<>();

        String sql = """
                SELECT id, user_id, description, amount,
                       category, transaction_date
                FROM transactions
                WHERE user_id = ?
                ORDER BY transaction_date DESC, id DESC
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);

            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {

                Transaction transaction = new Transaction(
                        rs.getLong("id"),
                        rs.getLong("user_id"),
                        rs.getString("description"),
                        rs.getBigDecimal("amount"),
                        rs.getString("category"),
                        rs.getDate("transaction_date").toLocalDate()
                );

                transactions.add(transaction);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return transactions;
    }

    public boolean update(Transaction transaction) {

        String sql = """
                UPDATE transactions
                SET description = ?,
                    amount = ?,
                    category = ?,
                    transaction_date = ?
                WHERE id = ? AND user_id = ?
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, transaction.getDescription());
            stmt.setBigDecimal(2, transaction.getAmount());
            stmt.setString(3, transaction.getCategory());
            stmt.setDate(
                    4,
                    Date.valueOf(transaction.getTransactionDate())
            );
            stmt.setLong(5, transaction.getId());
            stmt.setLong(6, transaction.getUserId());

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean delete(Long id, Long userId) {

        String sql = """
                DELETE FROM transactions
                WHERE id = ? AND user_id = ?
                """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);
            stmt.setLong(2, userId);

            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}