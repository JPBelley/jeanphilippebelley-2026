'use client'

import Link from 'next/link'
import Section from '../components/Section'
import PageLayout from '../components/layouts/PageLayout'
import posts from '../data/posts'

export default function Blog() {
  return (
    <PageLayout>
      <Section size="narrow">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-muted uppercase tracking-widest mb-1">// blog</p>
          <h1 className="text-4xl font-bold">Writing</h1>
          <p className="text-muted mt-2 text-sm">Notes on building things for the web.</p>
        </div>

        <div className="flex flex-col gap-5">
          {posts.filter(p => p.published).map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 p-7 bg-bg2 border border-ui rounded-xl no-underline text-inherit hover:border-[rgba(124,92,255,0.4)] transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold group-hover:text-violet transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-muted text-[14px] leading-relaxed">{post.description}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {post.tags.map(tag => (
                  <span key={tag} className="font-mono text-[10px] px-2 py-1 rounded border border-ui bg-bg text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </PageLayout>
  )
}
