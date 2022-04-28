import dedent from 'dedent-js';

/**
 * Tests support for all newline options
 * @param {string} language
 * @param {Function} format
 */
export default function supportsNewlineOptions(language, format) {
  it('throws error when newline is negative number', () => {
    expect(() => {
      format('SELECT *', { newline: -1 });
    }).toThrowErrorMatchingInlineSnapshot(`"newline config must be a positive number."`);
  });

  it('throws error when newline is zero', () => {
    expect(() => {
      format('SELECT *', { newline: 0 });
    }).toThrowErrorMatchingInlineSnapshot(`"newline config must be a positive number."`);
  });

  it('supports always mode', () => {
    const result = format('SELECT foo, bar, baz FROM qux;', {
      newline: 'always',
    });
    expect(result).toBe(dedent`
      SELECT
        foo,
        bar,
        baz
      FROM
        qux;
    `);
  });

  it('supports never mode', () => {
    const result = format('SELECT foo, bar, baz, qux FROM corge;', { newline: 'never' });
    expect(result).toBe(dedent`
      SELECT foo, bar, baz, qux
      FROM corge;
    `);
  });

  it('supports itemCount mode', () => {
    const result = format('SELECT foo, bar, baz, qux FROM corge;', {
      newline: 3,
    });
    expect(result).toBe(dedent`
      SELECT
        foo,
        bar,
        baz,
        qux
      FROM corge;
    `);
  });

  it('supports lineWidth mode', () => {
    const result = format('SELECT foo, bar, baz, qux FROM corge;', {
      newline: 'lineWidth',
      lineWidth: 20,
    });
    expect(result).toBe(dedent`
      SELECT
        foo,
        bar,
        baz,
        qux
      FROM corge;
    `);
  });

  it('supports hybrid mode', () => {
    const result = format('SELECT verylongfoo, verylongbar FROM baz GROUP BY foo, bar, baz, qux;', {
      newline: 2,
      lineWidth: 30,
    });
    expect(result).toBe(dedent`
      SELECT
        verylongfoo,
        verylongbar
      FROM baz
      GROUP BY
        foo,
        bar,
        baz,
        qux;
    `);
  });
}
