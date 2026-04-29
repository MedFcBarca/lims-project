using Microsoft.EntityFrameworkCore;
using Lims.Api.Data;
using Lims.Api.Services;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<PdfReportService>();
builder.Services.AddHttpClient<TranslationService>();
builder.Services.AddHttpClient<OcrService>();
builder.Services.AddScoped<AuditService>();
var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("ReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();