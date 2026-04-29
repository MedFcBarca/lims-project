using Lims.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Lims.Api.Services;

public class PdfReportService
{
    private readonly TranslationService _translationService;

    public PdfReportService(TranslationService translationService)
    {
        _translationService = translationService;
    }

    public async Task<byte[]> GenerateSampleReportAsync(
        Sample sample,
        List<Analysis> analyses,
        string language = "fr"
    )
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var hasNonCompliant = analyses.Any(a => !a.IsCompliant);

        var finalDecisionFr = hasNonCompliant
            ? "Décision finale : échantillon rejeté car au moins une analyse est non conforme."
            : "Décision finale : échantillon validé. Toutes les analyses sont conformes.";

        var sourceTexts = new List<string>
        {
            "Rapport d'analyse laboratoire",
            "Échantillon",
            "Informations échantillon",
            "Client",
            "Email",
            "Domaine",
            "Type d'échantillon",
            "Statut",
            "Créé le",
            "Résultats d'analyse",
            "Paramètre",
            "Valeur",
            "Unité",
            "Seuil",
            "Résultat",
            "Conforme",
            "Non conforme",
            finalDecisionFr,
            "Généré par LIMS Pro - "
        };

        var translated = await _translationService.TranslateBatchAsync(sourceTexts, language);

        var title = translated[0];
        var sampleLabel = translated[1];
        var sampleInfo = translated[2];
        var clientLabel = translated[3];
        var emailLabel = translated[4];
        var domainLabel = translated[5];
        var typeLabel = translated[6];
        var statusLabel = translated[7];
        var createdLabel = translated[8];
        var resultsLabel = translated[9];

        var parameterLabel = translated[10];
        var valueLabel = translated[11];
        var unitLabel = translated[12];
        var thresholdLabel = translated[13];
        var resultLabel = translated[14];

        var compliantText = translated[15];
        var nonCompliantText = translated[16];
        var finalDecision = translated[17];
        var generatedBy = translated[18];

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Size(PageSizes.A4);

                page.Header().Column(column =>
                {
                    column.Item().Text(title)
                        .FontSize(24)
                        .Bold()
                        .FontColor(Colors.Blue.Darken3);

                    column.Item().Text($"{sampleLabel}: {sample.Code}")
                        .FontSize(14)
                        .FontColor(Colors.Grey.Darken2);
                });

                page.Content().PaddingVertical(25).Column(column =>
                {
                    column.Spacing(20);

                    column.Item().Background(Colors.Grey.Lighten4).Padding(15).Column(info =>
                    {
                        info.Item().Text(sampleInfo).Bold().FontSize(16);
                        info.Item().Text($"{clientLabel}: {sample.Client?.Name}");
                        info.Item().Text($"{emailLabel}: {sample.Client?.Email}");
                        info.Item().Text($"{domainLabel}: {sample.Client?.Domain}");
                        info.Item().Text($"{typeLabel}: {sample.Type}");
                        info.Item().Text($"{statusLabel}: {sample.Status}");
                        info.Item().Text($"{createdLabel}: {sample.CreatedAt:yyyy-MM-dd HH:mm}");
                    });

                    column.Item().Text(resultsLabel).Bold().FontSize(16);

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellHeader).Text(parameterLabel);
                            header.Cell().Element(CellHeader).Text(valueLabel);
                            header.Cell().Element(CellHeader).Text(unitLabel);
                            header.Cell().Element(CellHeader).Text(thresholdLabel);
                            header.Cell().Element(CellHeader).Text(resultLabel);
                        });

                        foreach (var analysis in analyses)
                        {
                            table.Cell().Element(CellBody).Text(analysis.Parameter);
                            table.Cell().Element(CellBody).Text(analysis.Value.ToString());
                            table.Cell().Element(CellBody).Text(analysis.Unit);
                            table.Cell().Element(CellBody).Text(analysis.Threshold.ToString());
                            table.Cell().Element(CellBody).Text(
                                analysis.IsCompliant ? compliantText : nonCompliantText
                            );
                        }
                    });

                    column.Item()
                        .Background(hasNonCompliant ? Colors.Red.Lighten4 : Colors.Green.Lighten4)
                        .Padding(15)
                        .Text(finalDecision)
                        .Bold();
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span(generatedBy);
                    text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"));
                });
            });
        });

        return pdf.GeneratePdf();
    }

    private static IContainer CellHeader(IContainer container)
    {
        return container
            .Background(Colors.Blue.Darken3)
            .Padding(8)
            .DefaultTextStyle(x => x.FontColor(Colors.White).Bold());
    }

    private static IContainer CellBody(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(8);
    }
}