using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Lims.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StockItemId",
                table: "Analyses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StockItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    LotNumber = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Analyses_StockItemId",
                table: "Analyses",
                column: "StockItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Analyses_StockItems_StockItemId",
                table: "Analyses",
                column: "StockItemId",
                principalTable: "StockItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Analyses_StockItems_StockItemId",
                table: "Analyses");

            migrationBuilder.DropTable(
                name: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_Analyses_StockItemId",
                table: "Analyses");

            migrationBuilder.DropColumn(
                name: "StockItemId",
                table: "Analyses");
        }
    }
}
