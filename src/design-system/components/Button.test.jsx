import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('v2 Button', () => {
  it('renders children and is a <button> by default', () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('fires onClick when enabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hit</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Nope</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('primary variant with accent uses the accent ink var (AA contrast on paper)', () => {
    render(<Button variant="primary" accent="rust">Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.background).toContain('--accent-rust-ink');
  });

  it('soft variant uses the accent wash var', () => {
    render(<Button variant="soft" accent="moss">Soft</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.background).toContain('--accent-moss-wash');
  });

  it('ghost variant has a hairline border', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.border).toContain('--border-hairline');
  });

  it('renders as anchor when as="a" and omits type attribute', () => {
    render(<Button as="a" href="#x">Link</Button>);
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link.tagName).toBe('A');
    expect(link).not.toHaveAttribute('type');
  });

  it('size prop changes height', () => {
    const { rerender } = render(<Button size="sm">x</Button>);
    expect(screen.getByRole('button').style.height).toBe('32px');
    rerender(<Button size="lg">x</Button>);
    expect(screen.getByRole('button').style.height).toBe('48px');
  });

  it('block prop fills width', () => {
    render(<Button block>Wide</Button>);
    expect(screen.getByRole('button').style.width).toBe('100%');
  });
});
