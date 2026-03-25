<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps<{ content: string }>()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})

const rendered = computed(() => md.render(props.content))
</script>

<template>
  <div class="markdown-body" v-html="rendered" />
</template>

<style scoped>
.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: #1f2937;
  word-wrap: break-word;
}

/* Headings */
.markdown-body :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin: 1em 0 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #e5e7eb;
}
.markdown-body :deep(h2) {
  font-size: 1.3em;
  font-weight: 700;
  margin: 1em 0 0.5em;
  padding-bottom: 0.25em;
  border-bottom: 1px solid #e5e7eb;
}
.markdown-body :deep(h3) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
}
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  font-size: 1em;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
}

/* Paragraphs */
.markdown-body :deep(p) {
  margin: 0.6em 0;
}
.markdown-body :deep(p:first-child) {
  margin-top: 0;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

/* Lists */
.markdown-body :deep(ul) {
  list-style: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.markdown-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.markdown-body :deep(li) {
  margin: 0.25em 0;
}
.markdown-body :deep(li > ul),
.markdown-body :deep(li > ol) {
  margin: 0.15em 0;
}

/* Code */
.markdown-body :deep(code) {
  background: #f3f4f6;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.88em;
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
  color: #d63384;
}
.markdown-body :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0.6em 0;
}
.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: inherit;
}

/* Blockquote */
.markdown-body :deep(blockquote) {
  border-left: 3px solid #d1d5db;
  padding: 0.3em 0 0.3em 1em;
  margin: 0.6em 0;
  color: #6b7280;
  font-style: italic;
}
.markdown-body :deep(blockquote p) {
  margin: 0.3em 0;
}

/* Horizontal rule */
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1em 0;
}

/* Links */
.markdown-body :deep(a) {
  color: #2563eb;
  text-decoration: none;
}
.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

/* Strong / Em */
.markdown-body :deep(strong) {
  font-weight: 600;
  color: #111827;
}
.markdown-body :deep(em) {
  font-style: italic;
}

/* Tables */
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.6em 0;
  font-size: 0.9em;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  text-align: left;
}
.markdown-body :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}
.markdown-body :deep(tr:nth-child(even)) {
  background: #f9fafb;
}

/* Images */
.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}
</style>
