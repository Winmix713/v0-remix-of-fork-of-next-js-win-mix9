import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FilterSection } from "@/components/features/filter-section"

const mockProps = {
  filters: {
    homeTeam: "",
    awayTeam: "",
    btts: undefined,
    comeback: undefined,
  },
  onFiltersChange: vi.fn(),
  onApply: vi.fn(),
  onReset: vi.fn(),
  onExport: vi.fn(),
  isLoading: false,
}

describe("FilterSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render filter section with all controls", () => {
    render(<FilterSection {...mockProps} />)

    expect(screen.getByText("Szűrők")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /szűrés/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /visszaállítás/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /csv export/i })).toBeInTheDocument()
  })

  it("should call onApply when apply button is clicked", async () => {
    const user = userEvent.setup()
    render(<FilterSection {...mockProps} />)

    const applyButton = screen.getByRole("button", { name: /szűrés/i })
    await user.click(applyButton)

    expect(mockProps.onApply).toHaveBeenCalledTimes(1)
  })

  it("should call onReset when reset button is clicked", async () => {
    const user = userEvent.setup()
    render(<FilterSection {...mockProps} />)

    const resetButton = screen.getByRole("button", { name: /visszaállítás/i })
    await user.click(resetButton)

    expect(mockProps.onReset).toHaveBeenCalledTimes(1)
  })

  it("should call onExport when export button is clicked", async () => {
    const user = userEvent.setup()
    render(<FilterSection {...mockProps} />)

    const exportButton = screen.getByRole("button", { name: /csv export/i })
    await user.click(exportButton)

    expect(mockProps.onExport).toHaveBeenCalledTimes(1)
  })

  it("should disable buttons when loading", () => {
    render(<FilterSection {...mockProps} isLoading={true} />)

    const applyButton = screen.getByRole("button", { name: /szűrés/i })
    const resetButton = screen.getByRole("button", { name: /visszaállítás/i })
    const exportButton = screen.getByRole("button", { name: /csv export/i })

    expect(applyButton).toBeDisabled()
    expect(resetButton).toBeDisabled()
    expect(exportButton).toBeDisabled()
  })
})
