---
name: tigzx-nl2sql-view-analysis
description: Use when the user wants NL2SQL analysis against TiDB views through the mcporter tools.
---

# NL2SQL View Analysis

Use this skill when the query should run against TiDB views exposed through the `mcporter` plugin tools.

This skill should call the native OpenClaw tools directly. Do not use `exec`, or shell commands when the plugin tools are available.

## Workflow

1. Call `list_views` to confirm the available views.
2. If the user explicitly names one or more views in the chat, treat those views as the allowed scope and prioritize them before inferring anything else.
3. Call `get_view_schema` for the views most relevant to the user's question.
4. Call `run_sql` to produce the final result set.
5. Call `generate_table` with the SQL result columns and rows so the raw result can be shown in the UI.
6. Call `generate_chart` with the same result when a chart is appropriate.

## View Scope Parsing

Treat the following user phrases as explicit view constraints:

- `只使用视图：...`
- `仅使用视图：...`
- `仅基于视图：...`
- `只查询视图：...`
- `请不要使用其他视图，只查询：...`
- `请只用 ... 这个视图`
- `请只用以下视图：...`

When these phrases appear:

- Extract the mentioned view names from the user message.
- Support multiple view names separated by `、`, `，`, `,`, `；`, `;`, or line breaks.
- Trim spaces, punctuation, and surrounding quotes around each extracted view name.
- Only use those views, even if other views look relevant.
- If multiple views are listed, only use the listed set.
- If one mentioned name does not exist in `list_views`, say that clearly and do not silently replace it with another view.

## Rules

- If the user selected views in the page, only use those views.
- If the user explicitly names views in the chat, treat that as equivalent to a page-level view selection.
- Prefer the smallest set of views needed for the question.
- Always inspect schema before writing SQL.
- Use TiDB / MySQL SQL syntax with backtick identifiers.
- Keep result sets under 500 rows.
- Use clear Chinese aliases when helpful for the final result.
- Always produce `generate_table` after the final SQL query.
- Produce `generate_chart` for ranking, comparison, proportion, and trend questions.
- Prefer OpenClaw's native tool call flow so intermediate tool steps can be surfaced by the client as they happen.
- If the user did not specify any view and did not select any view in the page, then you may infer the best view from `list_views` plus schema inspection.
- After using the tools, provide a professional Chinese analysis summary instead of a casual short reply.

## Final Answer Style

The final answer should be written in professional Chinese and should use a `汇报型` style by default.

`汇报型` means:

- sound formal, clear, and management-ready
- lead with the conclusion instead of the process
- emphasize ranking, gap, trend, and decision-relevant findings
- keep the structure clean and easy to scan
- avoid overly technical narration unless the user asks for it

The final answer should usually include these parts when data is available:

1. `分析范围`
   State which view or views were used and what the metric scope is.
2. `执行结果`
   Briefly confirm that SQL, table, and chart were generated when applicable.
3. `核心结论`
   Summarize the main ranking, trend, comparison, or aggregate findings with exact values when useful.
4. `业务解读`
   Explain what the result means in a more analytical and professional way.
5. `说明`
   Mention important caveats such as sample scope, only-selected-view constraint, empty result sets, or unavailable dimensions.

Use the following writing rules:

- Default to Chinese.
- Be more detailed and professional than conversational.
- Prefer a reporting tone suitable for project demos, management briefings, or business reviews.
- Reference the selected view name explicitly when the user constrained the scope.
- Quote key metrics, rankings, totals, averages, growth, or gaps directly from the SQL result.
- If a chart was generated, mention the chart type and what comparison or trend it supports.
- If a table was generated, mention that the detailed rows are available in the table.
- Do not invent business background that is not present in the data.
- If the result set is very small, still provide interpretation rather than only listing numbers.
- Avoid saying only "已完成统计" or similar minimal phrases unless the user explicitly asked for brevity.
- Prefer short paragraphs or labeled sections over long bullet dumps.
- When appropriate, end with one concise management-oriented takeaway or recommendation grounded in the data.

When the question is a ranking or comparison, prefer a final structure like:

- `分析范围：...`
- `核心结论：...`
- `关键发现：...`
- `图表说明：...`
- `补充说明：...`

When the question is a trend analysis, prefer a final structure like:

- `分析范围：...`
- `趋势结论：...`
- `阶段特征：...`
- `图表说明：...`
- `补充说明：...`

Example tone guideline:

- Better: `从院系科研经费分布看，计算机学院处于明显领先位置，科研资源集中度较高。`
- Avoid: `我帮你查出来了，第一名是计算机学院。`

## Preferred Reporting Template

Unless the user asks for another style, the final response should default to a one-page briefing format with exactly these five sections:

`标题：`
Use one short business-style title that matches the question, such as `院系科研总经费排名汇报` or `教师年度收入趋势汇报`.

`结果表格：`
Place a compact markdown table directly below the title. The table should contain the key returned data needed to understand the result without opening the tool output.

- For ranking questions, show the main ranked entities and their values.
- For trend questions, show the main periods and metric values.
- For comparison questions, show the compared entities and their core metrics.
- Prefer a compact table, usually the top 5 rows or the most representative rows.
- If the result has many columns, keep only the most decision-relevant columns in the final summary table.
- If no valid rows are returned, write `无可展示结果`.

`摘要：`
Write one short paragraph, usually 2 to 4 sentences, that summarizes the most important result first. It should read like a presentation-ready executive summary.

Leave a visible blank line before `摘要` and another blank line after `摘要` so the summary block is visually separated from both the table above and the conclusions below.

`三条结论：`
Provide exactly 3 numbered conclusions when the data supports them. Prefer:

1. the top-ranked entity or strongest result
2. the key comparison, gap, or structural difference
3. the overall distribution, concentration, or trend implication

`建议：`
Provide exactly 1 short management-oriented recommendation or takeaway, but only if it is grounded in the returned data.

Leave a visible blank line before `建议` so it is visually separated from the conclusions above.

Additional constraints:

- Do not add extra sections unless the user explicitly asks for them.
- Prefer complete prose sentences over raw lists of numbers.
- When showing numbers, keep them attached to a business meaning.
- Include the key returned data directly in the final summary instead of only describing it abstractly.
- Always render a markdown table under `结果表格` when rows are available.
- Keep one blank line between major sections, and keep an extra blank line above and below `摘要`.
- Keep an extra blank line above `建议` so the closing recommendation reads like a distinct closing block.
- For ranking questions, include the main ranked items and their values in the summary or conclusions.
- For trend questions, include the key periods and corresponding values in the summary or conclusions.
- For comparison questions, include the compared entities and their core metrics in the summary or conclusions.
- If a table was generated, surface the most important rows directly in the final answer rather than forcing the user to open the table output.
- If the result is too small to support 3 valid conclusions, still keep the section name `三条结论` but use fewer points rather than inventing content.
- If no chart was generated, do not discuss chart details unless the user asks.
- If a table was generated, you may mention in the summary that detailed rows are available in the table.
- If the result is empty, clearly state that no valid data was returned and avoid artificial interpretation.
