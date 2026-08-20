# Neue Haas Unica (licensed — files not vendored)

Neue Haas Unica is a paid Monotype typeface, so its files are not committed by default.
Drop the licensed web font files into this directory with exactly these names:

```
NeueHaasUnica-Regular.woff2   (weight 400)
NeueHaasUnica-Medium.woff2    (weight 500)
```

`src/styles/fonts.css` already declares the matching `@font-face` rules. Until the files
are present, the fallback stack (`Helvetica Neue`, Helvetica, Arial) renders — nothing
breaks, and no code change is needed when the files land. The build warns (does not fail)
while they're missing.
