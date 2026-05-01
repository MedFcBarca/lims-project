using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lims.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSamplingRequestIdToSample : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SamplingRequestId",
                table: "Samples",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SamplingRequestId",
                table: "Samples");
        }
    }
}
