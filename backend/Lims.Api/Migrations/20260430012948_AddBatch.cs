using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Lims.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BatchId",
                table: "Samples",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Batches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "text", nullable: false),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Batches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Batches_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Samples_BatchId",
                table: "Samples",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_ClientId",
                table: "Batches",
                column: "ClientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Samples_Batches_BatchId",
                table: "Samples",
                column: "BatchId",
                principalTable: "Batches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Samples_Batches_BatchId",
                table: "Samples");

            migrationBuilder.DropTable(
                name: "Batches");

            migrationBuilder.DropIndex(
                name: "IX_Samples_BatchId",
                table: "Samples");

            migrationBuilder.DropColumn(
                name: "BatchId",
                table: "Samples");
        }
    }
}
