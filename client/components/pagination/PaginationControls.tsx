"use client"

import { useEffect } from 'react'
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
	page: number
	totalPages: number
	isFetching?: boolean
	onChange: (page: number) => void
	showEdges?: boolean
	siblingCount?: number
}

// Generate page numbers with ellipsis
function buildPages(current: number, total: number, siblingCount: number): (number | "...")[] {
	const pages: (number|"...")[] = []
	const start = Math.max(2, current - siblingCount)
	const end = Math.min(total - 1, current + siblingCount)
	pages.push(1)
	if (start > 2) pages.push("...")
	for (let i = start; i <= end; i++) pages.push(i)
	if (end < total - 1) pages.push("...")
	if (total > 1) pages.push(total)
	return pages
}

export function PaginationControls({ page, totalPages, isFetching, onChange, showEdges = true, siblingCount = 1 }: PaginationControlsProps) {
	const pages = buildPages(page, totalPages, siblingCount)

	const canPrev = page > 1
	const canNext = page < totalPages

	// Keyboard navigation
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' && canPrev) onChange(page - 1)
			else if (e.key === 'ArrowRight' && canNext) onChange(page + 1)
		}
		window.addEventListener('keydown', handler)
		return () => window.removeEventListener('keydown', handler)
	}, [page, canPrev, canNext, onChange])

	const btnBase = "h-10 min-w-[40px] px-3 inline-flex items-center justify-center rounded-xl text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed select-none backdrop-blur-sm"

	const renderNumber = (p: number | "...") => {
		if (p === "...") return <span key={`e-${Math.random()}`} className="px-2 text-muted-foreground">…</span>
		const active = p === page
		return (
			<button
				key={p}
				type="button"
				aria-label={`Go to page ${p}`}
				aria-current={active ? 'page' : undefined}
				disabled={isFetching && active}
				onClick={() => onChange(p)}
				className={cn(btnBase,
					active ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-500/50 shadow-lg shadow-cyan-500/25" : "glass-card hover:bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-white hover:shadow-md hover:shadow-cyan-500/10"
				)}
			>{p}</button>
		)
	}

	const iconCls = "w-4 h-4"
	return (
		<nav aria-label="Pagination" className="w-full">
			<div className="flex flex-wrap items-center gap-2">
				{showEdges && (
					<button
						type="button"
						onClick={() => canPrev && onChange(1)}
						disabled={!canPrev || isFetching}
						className={cn(btnBase, "w-10", canPrev?"glass-card hover:bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-white":"bg-slate-800/50 border-slate-700/50 text-slate-500")}
						aria-label="First page"
					>
						<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
					</button>
				)}
				<button
					type="button"
					onClick={() => canPrev && onChange(page - 1)}
					disabled={!canPrev || isFetching}
					className={cn(btnBase, canPrev?"glass-card hover:bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-white":"bg-slate-800/50 border-slate-700/50 text-slate-500")}
					aria-label="Previous page"
				>
					<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
				</button>
				<div className="flex items-center gap-1">{pages.map(renderNumber)}</div>
				<button
					type="button"
					onClick={() => canNext && onChange(page + 1)}
					disabled={!canNext || isFetching}
					className={cn(btnBase, canNext?"glass-card hover:bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-white":"bg-slate-800/50 border-slate-700/50 text-slate-500")}
					aria-label="Next page"
				>
					<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
				</button>
				{showEdges && (
					<button
						type="button"
						onClick={() => canNext && onChange(totalPages)}
						disabled={!canNext || isFetching}
						className={cn(btnBase, "w-10", canNext?"glass-card hover:bg-slate-700/50 border-slate-600/50 hover:border-cyan-400/50 text-slate-200 hover:text-white":"bg-slate-800/50 border-slate-700/50 text-slate-500")}
						aria-label="Last page"
					>
						<svg className={iconCls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
					</button>
				)}
			</div>
			<p className="mt-3 text-sm text-slate-300 font-medium text-center bg-slate-800/30 rounded-lg px-3 py-2 backdrop-blur-sm border border-slate-600/30">Page {page} of {totalPages}</p>
		</nav>
	)
}

export default PaginationControls
