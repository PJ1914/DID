# Circuit Artifacts Placeholder

Place compiled circuit artifacts (`*.wasm`, `*_final.zkey`, and `verification_key.json`) in this directory.

Expected file layout:

```
public/circuits/
  age_check/
    circuit.wasm
    circuit_final.zkey
    verification_key.json
  age_max_check/
    ...
  attr_equals/
    ...
  income_check/
    ...
```

Update the application configuration in `src/lib/snark.ts` if you change these names or paths.
