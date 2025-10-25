# T-2.4.1: Breakpoint System Documentation - Enhanced Testing Protocol

## Mission Statement
You shall execute complete testing cycle from environment setup through visual validation with LLM Vision analysis to ensure T-2.4.1 Breakpoint System Documentation (5 documentation files totaling 2,752 lines) are properly implemented, accurate to legacy references, and functioning with complete TypeScript compliance and Next.js 14 SSR compatibility.

## Fix/Test/Analyze Cycle Pattern
For any failed validation step in ANY phase:
1. **Log Issue**: Document failure details and error messages with specific file and line references
2. **Attempt Fix**: Apply automated correction if possible, focusing on legacy accuracy and TypeScript compliance  
3. **Re-run Test**: Execute the failed step again
4. **Evaluate Results**: Check if issue is resolved against T-2.4.1 success criteria
5. **Update Artifacts**: Regenerate affected files (scaffolds, screenshots, reports) as needed
6. **Repeat**: Continue until success or maximum iterations reached (default: 3 attempts)

## Test Approach - T-2.4.1 Specific

You must test T-2.4.1: Breakpoint System Documentation which has successfully implemented 5 comprehensive documentation files following the proven T-2.3.5 pattern. This task extracted breakpoint definitions from `aplio-legacy/tailwind.config.js` lines 13-17 and container configuration from lines 17-19, creating TypeScript-compliant responsive documentation with Next.js 14 SSR compatibility.

## Phase 0: Pre-Testing Environment Setup

### Prerequisites
- You are in the pmc directory  
- You have npm and Node.js installed
- Git bash or equivalent terminal access
- T-2.4.1 documentation files are implemented and ready for validation

### Actions

#### Step 0.1: Navigate to Application Directory
```bash
# PURPOSE: Navigate from pmc directory to aplio-modern-1 application directory where T-2.4.1 documentation exists
# WHEN: Execute this as the first step before any T-2.4.1 testing operations
# PREREQUISITES: You are currently in pmc directory (default shell location)
# EXPECTED OUTCOME: You will be in aplio-modern-1/ directory with access to design-system/docs/responsive/breakpoints/
# FAILURE HANDLING: If directory doesn't exist, verify you're in the correct project structure
# T-2.4.1 SPECIFIC: Must access design-system/docs/responsive/breakpoints/ directory where all 5 files are located

cd ..
cd aplio-modern-1
```

#### Step 0.2: Create T-2.4.1 Test Directory Structure
```bash
# PURPOSE: Create the complete directory structure required specifically for T-2.4.1 breakpoint documentation testing
# WHEN: Run this before any testing phases to ensure all T-2.4.1 output directories exist
# PREREQUISITES: You are in aplio-modern-1/ directory
# EXPECTED OUTCOME: All required test directories exist for T-2.4.1 documentation validation
# FAILURE HANDLING: If mkdir fails, check permissions and available disk space
# T-2.4.1 SPECIFIC: Focus on documentation testing rather than component testing

mkdir -p test/unit-tests/task-2-4/T-2.4.1
mkdir -p test/screenshots/T-2.4.1/responsive-docs
mkdir -p test/validation/T-2.4.1/legacy-accuracy
mkdir -p test/validation/T-2.4.1/typescript-compilation  
mkdir -p test/validation/T-2.4.1/cross-references
mkdir -p test/reports/T-2.4.1
mkdir -p test/results/T-2.4.1
```

#### Step 0.3: Verify T-2.4.1 Documentation Files Exist
```bash
# PURPOSE: Confirm all 5 T-2.4.1 breakpoint documentation files are present and accessible
# WHEN: Run this immediately after directory creation to validate implementation completion
# PREREQUISITES: T-2.4.1 implementation has been completed
# EXPECTED OUTCOME: All 5 documentation files confirmed present with correct line counts
# FAILURE HANDLING: If files missing, implementation is incomplete - alert and stop testing
# T-2.4.1 SPECIFIC: Must verify exact files created: breakpoint-definitions.md (643 lines), responsive-guidelines.md (882 lines), etc.

echo "=== VERIFYING T-2.4.1 DOCUMENTATION FILES ==="
ls -la design-system/docs/responsive/breakpoints/
echo ""
echo "Checking specific T-2.4.1 files:"
echo "1. breakpoint-definitions.md (expected ~643 lines)"
wc -l design-system/docs/responsive/breakpoints/breakpoint-definitions.md || echo "MISSING: breakpoint-definitions.md"
echo "2. responsive-guidelines.md (expected ~882 lines)"  
wc -l design-system/docs/responsive/breakpoints/responsive-guidelines.md || echo "MISSING: responsive-guidelines.md"
echo "3. container-width-constraints.md (expected ~557 lines)"
wc -l design-system/docs/responsive/breakpoints/container-width-constraints.md || echo "MISSING: container-width-constraints.md"
echo "4. breakpoint-testing-guide.md (expected ~82 lines)"
wc -l design-system/docs/responsive/breakpoints/breakpoint-testing-guide.md || echo "MISSING: breakpoint-testing-guide.md"
echo "5. responsive-visual-reference.md (expected ~588 lines)"
wc -l design-system/docs/responsive/breakpoints/responsive-visual-reference.md || echo "MISSING: responsive-visual-reference.md"
echo ""
echo "=== T-2.4.1 FILE VERIFICATION COMPLETE ==="
```

#### Step 0.4: Verify Legacy Reference File Access
```bash
# PURPOSE: Ensure aplio-legacy/tailwind.config.js is accessible for accuracy validation
# WHEN: Run this after T-2.4.1 file verification to confirm legacy reference availability  
# PREREQUISITES: Legacy codebase exists in project structure
# EXPECTED OUTCOME: Legacy tailwind.config.js confirmed accessible with lines 13-17 and 21-23 visible
# FAILURE HANDLING: If legacy file not accessible, accuracy validation cannot proceed
# T-2.4.1 SPECIFIC: Must verify specific lines 13-17 (breakpoints) and 21-23 (container) are accessible

echo "=== VERIFYING LEGACY REFERENCE ACCESS ==="
cd ..
echo "Checking aplio-legacy/tailwind.config.js access:"
ls -la aplio-legacy/tailwind.config.js || echo "CRITICAL: Legacy reference file not found"
echo ""
echo "Verifying specific T-2.4.1 reference lines:"
echo "Lines 13-17 (breakpoint definitions):"
sed -n '13,17p' aplio-legacy/tailwind.config.js || echo "ERROR: Cannot access lines 13-17"
echo ""
echo "Lines 21-23 (container configuration):"
sed -n '17,19p' aplio-legacy/tailwind.config.js || echo "ERROR: Cannot access lines 17-19"
echo ""
cd aplio-modern-1
echo "=== LEGACY REFERENCE VERIFICATION COMPLETE ==="
```

### Validation
- [ ] aplio-modern-1/ directory accessed successfully
- [ ] All T-2.4.1 test directories created
- [ ] All 5 T-2.4.1 documentation files confirmed present with expected line counts
- [ ] Legacy reference file aplio-legacy/tailwind.config.js accessible  
- [ ] Specific legacy lines 13-17 and 21-23 readable for accuracy validation

### Deliverables
- Complete test directory structure for T-2.4.1 documentation testing
- Verified access to all 5 implementation files
- Confirmed legacy reference accessibility for accuracy validation

## Phase 1: T-2.4.1 Legacy Accuracy Validation

### Prerequisites (builds on Phase 0)
- Test environment setup complete from Phase 0
- All 5 T-2.4.1 documentation files confirmed present
- Legacy reference file accessible

### Actions

#### Step 1.1: Validate Breakpoint Definitions Accuracy
```bash
# PURPOSE: Verify 100% accuracy of breakpoint definitions against aplio-legacy/tailwind.config.js lines 13-17
# WHEN: Execute this as first validation step to ensure core breakpoint accuracy
# PREREQUISITES: breakpoint-definitions.md exists, legacy file accessible
# EXPECTED OUTCOME: All breakpoint values match legacy exactly: xs: '475px', '1xl': '1400px', plus defaultTheme.screens
# FAILURE HANDLING: If mismatch found, document specific discrepancies and fail validation
# T-2.4.1 SPECIFIC: Must validate custom xs:475px and 1xl:1400px values plus defaultTheme.screens reference

echo "=== T-2.4.1 BREAKPOINT DEFINITIONS ACCURACY VALIDATION ==="
echo "Extracting legacy breakpoint definitions from lines 13-17:"
cd ..
sed -n '13,17p' aplio-legacy/tailwind.config.js > test-legacy-breakpoints.txt
cat test-legacy-breakpoints.txt
echo ""
cd aplio-modern-1
echo "Searching for breakpoint definitions in breakpoint-definitions.md:"
echo "Looking for xs: '475px'"
grep -n "xs.*475px" design-system/docs/responsive/breakpoints/breakpoint-definitions.md || echo "ERROR: xs:475px not found"
echo "Looking for 1xl: '1400px'"  
grep -n "1xl.*1400px" design-system/docs/responsive/breakpoints/breakpoint-definitions.md || echo "ERROR: 1xl:1400px not found"
echo "Looking for defaultTheme.screens reference"
grep -n "defaultTheme.screens" design-system/docs/responsive/breakpoints/breakpoint-definitions.md || echo "ERROR: defaultTheme.screens reference not found"
echo ""
echo "=== BREAKPOINT DEFINITIONS ACCURACY VALIDATION COMPLETE ==="
rm ../test-legacy-breakpoints.txt
```

#### Step 1.2: Validate Container Configuration Accuracy  
```bash
# PURPOSE: Verify 100% accuracy of container configuration against aplio-legacy/tailwind.config.js lines 17-19
# WHEN: Execute after breakpoint validation to ensure container documentation accuracy
# PREREQUISITES: container-width-constraints.md exists, legacy file accessible
# EXPECTED OUTCOME: Container configuration matches legacy exactly: container: { center: true }
# FAILURE HANDLING: If container config mismatch found, document and fail validation
# T-2.4.1 SPECIFIC: Must validate center: true configuration and container width constraints

echo "=== T-2.4.1 CONTAINER CONFIGURATION ACCURACY VALIDATION ==="
echo "Extracting legacy container configuration from lines 17-19:"
cd ..
sed -n '17,19p' aplio-legacy/tailwind.config.js > test-legacy-container.txt
cat test-legacy-container.txt
echo ""
cd aplio-modern-1
echo "Searching for container configuration in container-width-constraints.md:"
echo "Looking for center: true configuration"
grep -n "center.*true" design-system/docs/responsive/breakpoints/container-width-constraints.md || echo "ERROR: center:true not found"
echo "Looking for legacy reference to lines 17-19"
grep -n "lines 17-19" design-system/docs/responsive/breakpoints/container-width-constraints.md || echo "ERROR: Legacy reference not found"
echo ""
echo "=== CONTAINER CONFIGURATION ACCURACY VALIDATION COMPLETE ==="
rm ../test-legacy-container.txt
```

#### Step 1.3: Validate Legacy Reference Citations
```bash
# PURPOSE: Ensure all documentation properly cites specific legacy file lines as required
# WHEN: Execute after individual accuracy validations to verify proper attribution
# PREREQUISITES: All 5 documentation files exist
# EXPECTED OUTCOME: All files properly reference aplio-legacy/tailwind.config.js with specific line numbers
# FAILURE HANDLING: If citations missing or incorrect, document which files need fixes
# T-2.4.1 SPECIFIC: Must find references to lines 13-17 and 21-23 in appropriate documentation files

echo "=== T-2.4.1 LEGACY REFERENCE CITATIONS VALIDATION ==="
echo "Checking for proper legacy references across all 5 files:"
echo ""
for file in design-system/docs/responsive/breakpoints/*.md; do
    echo "Checking $(basename "$file"):"
    echo "  Lines 13-17 reference:"
    grep -n "13-17" "$file" && echo "    ✓ Found" || echo "    ✗ Missing"
    echo "  Lines 21-23 reference:"  
    grep -n "21-23" "$file" && echo "    ✓ Found" || echo "    ✗ Missing"
    echo "  aplio-legacy/tailwind.config.js reference:"
    grep -n "aplio-legacy/tailwind.config.js" "$file" && echo "    ✓ Found" || echo "    ✗ Missing"
    echo ""
done
echo "=== LEGACY REFERENCE CITATIONS VALIDATION COMPLETE ==="
```

### Validation
- [ ] Breakpoint definitions match legacy lines 13-17 exactly (xs:475px, 1xl:1400px, defaultTheme.screens)
- [ ] Container configuration matches legacy lines 17-19 exactly (center: true)
- [ ] All documentation files properly cite legacy references with specific line numbers
- [ ] No discrepancies found between implementation and legacy source

## Phase 2: T-2.4.1 TypeScript Compilation Validation

### Prerequisites (builds on Phase 1)
- Legacy accuracy validation passed
- TypeScript and ts-node available in environment

### Actions

#### Step 2.1: Extract and Compile TypeScript Code Examples
```bash
# PURPOSE: Extract all TypeScript code examples from T-2.4.1 documentation and verify compilation with strict mode
# WHEN: Execute after legacy validation to ensure all code examples are TypeScript compliant
# PREREQUISITES: TypeScript environment available, all documentation files present
# EXPECTED OUTCOME: All TypeScript code examples compile successfully with strict mode enabled
# FAILURE HANDLING: If compilation fails, document specific errors and file locations
# T-2.4.1 SPECIFIC: Must test TypeScript utilities, interfaces, and Next.js 14 SSR-safe patterns

echo "=== T-2.4.1 TYPESCRIPT COMPILATION VALIDATION ==="
mkdir -p test/validation/T-2.4.1/typescript-compilation
cd test/validation/T-2.4.1/typescript-compilation

echo "Extracting TypeScript code blocks from all T-2.4.1 documentation files..."
echo ""

# Extract from breakpoint-definitions.md
echo "Processing breakpoint-definitions.md:"
awk '/```typescript/,/```/' ../../../../design-system/docs/responsive/breakpoints/breakpoint-definitions.md > breakpoint-definitions-code.ts
echo "  Extracted TypeScript code blocks"

# Extract from responsive-guidelines.md  
echo "Processing responsive-guidelines.md:"
awk '/```typescript/,/```/' ../../../../design-system/docs/responsive/breakpoints/responsive-guidelines.md > responsive-guidelines-code.ts
echo "  Extracted TypeScript code blocks"

# Extract from container-width-constraints.md
echo "Processing container-width-constraints.md:"
awk '/```typescript/,/```/' ../../../../design-system/docs/responsive/breakpoints/container-width-constraints.md > container-constraints-code.ts
echo "  Extracted TypeScript code blocks"

# Extract from breakpoint-testing-guide.md
echo "Processing breakpoint-testing-guide.md:"
awk '/```typescript/,/```/' ../../../../design-system/docs/responsive/breakpoints/breakpoint-testing-guide.md > testing-guide-code.ts
echo "  Extracted TypeScript code blocks"

# Extract from responsive-visual-reference.md
echo "Processing responsive-visual-reference.md:"
awk '/```typescript/,/```/' ../../../../design-system/docs/responsive/breakpoints/responsive-visual-reference.md > visual-reference-code.ts
echo "  Extracted TypeScript code blocks"

echo ""
echo "TypeScript code extraction complete."
cd ../../../..
```

#### Step 2.2: Validate TypeScript Strict Mode Compliance
```bash
# PURPOSE: Compile all extracted TypeScript code with strict mode to ensure compliance
# WHEN: Execute after code extraction to validate TypeScript quality
# PREREQUISITES: TypeScript code extracted successfully
# EXPECTED OUTCOME: All TypeScript code compiles without errors in strict mode
# FAILURE HANDLING: If compilation errors, document each error with file and line reference
# T-2.4.1 SPECIFIC: Validate responsive utilities, breakpoint detection functions, SSR-safe hooks

echo "=== T-2.4.1 TYPESCRIPT STRICT MODE VALIDATION ==="
cd test/validation/T-2.4.1/typescript-compilation

# Create tsconfig with strict mode for testing
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": false,
    "skipLibCheck": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve"
  },
  "include": ["*.ts", "*.tsx"],
  "exclude": ["node_modules"]
}
EOF

echo "Created strict TypeScript configuration"
echo ""
echo "Compiling all T-2.4.1 TypeScript code with strict mode:"
echo ""

for file in *.ts; do
    if [ -f "$file" ]; then
        echo "Compiling $file:"
        npx tsc --noEmit "$file" && echo "  ✓ Compilation successful" || echo "  ✗ Compilation failed"
        echo ""
    fi
done

echo "=== TYPESCRIPT STRICT MODE VALIDATION COMPLETE ==="
cd ../../../..
```

### Validation
- [ ] All TypeScript code examples extracted successfully from 5 documentation files
- [ ] TypeScript strict mode configuration created and applied
- [ ] All extracted TypeScript code compiles without errors in strict mode
- [ ] No type safety violations or implicit any types found

## Phase 3: T-2.4.1 Cross-Reference Integration Testing

### Prerequisites (builds on Phase 2)
- TypeScript validation passed
- T-2.3.5 accessibility documentation available for cross-reference testing

### Actions

#### Step 3.1: Validate T-2.3.5 Accessibility Cross-References
```bash
# PURPOSE: Verify all cross-reference links to T-2.3.5 accessibility documentation are functional
# WHEN: Execute after TypeScript validation to ensure integration links work
# PREREQUISITES: T-2.3.5 accessibility documentation exists in design-system/docs/accessibility/
# EXPECTED OUTCOME: All cross-reference links resolve to existing files and sections
# FAILURE HANDLING: If links broken, document specific missing references and files
# T-2.4.1 SPECIFIC: Must validate focus-management, screen-reader, and keyboard navigation integration links

echo "=== T-2.4.1 CROSS-REFERENCE INTEGRATION VALIDATION ==="
echo "Checking T-2.3.5 accessibility integration links..."
echo ""

# Check if T-2.3.5 accessibility files exist
echo "Verifying T-2.3.5 accessibility documentation exists:"
ls -la design-system/docs/accessibility/ || echo "ERROR: T-2.3.5 accessibility docs not found"
echo ""

# Check specific integration references
echo "Validating specific cross-reference links mentioned in T-2.4.1 documentation:"
echo ""

echo "1. Focus management integration:"
grep -r "focus-management.md" design-system/docs/responsive/breakpoints/ && echo "  ✓ Reference found"
ls -la design-system/docs/accessibility/focus-management.md && echo "  ✓ Target file exists" || echo "  ✗ Target file missing"
echo ""

echo "2. Screen reader integration:"
grep -r "screen-reader-optimization.md" design-system/docs/responsive/breakpoints/ && echo "  ✓ Reference found"
ls -la design-system/docs/accessibility/screen-reader-optimization.md && echo "  ✓ Target file exists" || echo "  ✗ Target file missing"
echo ""

echo "3. Keyboard navigation integration:"
grep -r "keyboard-navigation.md" design-system/docs/responsive/breakpoints/ && echo "  ✓ Reference found"  
ls -la design-system/docs/accessibility/keyboard-navigation.md && echo "  ✓ Target file exists" || echo "  ✗ Target file missing"
echo ""

echo "=== CROSS-REFERENCE INTEGRATION VALIDATION COMPLETE ==="
```

#### Step 3.2: Validate Documentation Structure Matches T-2.3.5 Pattern
```bash
# PURPOSE: Verify T-2.4.1 follows the exact 5-file pattern proven successful in T-2.3.5
# WHEN: Execute after cross-reference validation to ensure structural consistency
# PREREQUISITES: Both T-2.3.5 and T-2.4.1 documentation complete
# EXPECTED OUTCOME: File structure and organization matches T-2.3.5 proven pattern exactly
# FAILURE HANDLING: If structure differs, document deviations from proven pattern
# T-2.4.1 SPECIFIC: Must confirm 5-file structure matches T-2.3.5 accessibility implementation

echo "=== T-2.4.1 DOCUMENTATION STRUCTURE VALIDATION ==="
echo "Comparing T-2.4.1 structure with proven T-2.3.5 pattern..."
echo ""

echo "T-2.3.5 accessibility structure:"
ls -la design-system/docs/accessibility/ | wc -l && echo "  File count logged"
echo ""

echo "T-2.4.1 breakpoints structure:"
ls -la design-system/docs/responsive/breakpoints/ | wc -l && echo "  File count logged"
echo ""

echo "Verifying T-2.4.1 follows 5-file pattern:"
echo "1. Main definitions file: breakpoint-definitions.md"
ls -la design-system/docs/responsive/breakpoints/breakpoint-definitions.md && echo "  ✓ Present" || echo "  ✗ Missing"
echo "2. Implementation guidelines: responsive-guidelines.md"
ls -la design-system/docs/responsive/breakpoints/responsive-guidelines.md && echo "  ✓ Present" || echo "  ✗ Missing"
echo "3. Constraints documentation: container-width-constraints.md"
ls -la design-system/docs/responsive/breakpoints/container-width-constraints.md && echo "  ✓ Present" || echo "  ✗ Missing"
echo "4. Testing guide: breakpoint-testing-guide.md"
ls -la design-system/docs/responsive/breakpoints/breakpoint-testing-guide.md && echo "  ✓ Present" || echo "  ✗ Missing"
echo "5. Visual reference: responsive-visual-reference.md"
ls -la design-system/docs/responsive/breakpoints/responsive-visual-reference.md && echo "  ✓ Present" || echo "  ✗ Missing"
echo ""

echo "=== DOCUMENTATION STRUCTURE VALIDATION COMPLETE ==="
```

### Validation
- [ ] All T-2.3.5 accessibility cross-reference links are functional
- [ ] Target accessibility documentation files exist and are accessible
- [ ] T-2.4.1 follows exact 5-file pattern from proven T-2.3.5 implementation
- [ ] Documentation structure maintains consistency with successful pattern

## Phase 4: T-2.4.1 Next.js 14 SSR Compatibility Testing

### Prerequisites (builds on Phase 3)
- Cross-reference integration validated
- Next.js 14 environment available for testing

### Actions

#### Step 4.1: Validate SSR-Safe Responsive Patterns
```bash
# PURPOSE: Ensure all responsive patterns documented in T-2.4.1 are Next.js 14 SSR compatible
# WHEN: Execute after cross-reference validation to verify SSR safety
# PREREQUISITES: Next.js 14 project structure available
# EXPECTED OUTCOME: All responsive patterns work in SSR environment without hydration errors
# FAILURE HANDLING: If SSR issues found, document specific problematic patterns
# T-2.4.1 SPECIFIC: Must validate responsive hooks, breakpoint detection, and container utilities

echo "=== T-2.4.1 NEXT.JS 14 SSR COMPATIBILITY VALIDATION ==="
echo "Validating SSR-safe responsive patterns from T-2.4.1 documentation..."
echo ""

# Check for SSR-safe patterns in documentation
echo "Searching for SSR-safe pattern documentation:"
echo ""

echo "1. SSR-safe hooks mentioned:"
grep -r "SSR.*safe\|server.*side.*render" design-system/docs/responsive/breakpoints/ && echo "  ✓ SSR patterns documented" || echo "  ⚠ SSR patterns may be missing"
echo ""

echo "2. Next.js 14 compatibility mentioned:"
grep -r "Next\.js 14\|App Router" design-system/docs/responsive/breakpoints/ && echo "  ✓ Next.js 14 compatibility documented" || echo "  ⚠ Next.js 14 references may be missing"
echo ""

echo "3. Hydration-safe patterns:"
grep -r "hydration\|client.*side" design-system/docs/responsive/breakpoints/ && echo "  ✓ Hydration considerations documented" || echo "  ⚠ Hydration safety may need review"
echo ""

echo "4. useEffect pattern usage for client-side detection:"
grep -r "useEffect\|useState.*window" design-system/docs/responsive/breakpoints/ && echo "  ✓ Client-side detection patterns found" || echo "  ⚠ Client-side patterns may be missing"
echo ""

echo "=== NEXT.JS 14 SSR COMPATIBILITY VALIDATION COMPLETE ==="
```

#### Step 4.2: Validate Mobile-First Methodology Consistency
```bash
# PURPOSE: Ensure mobile-first methodology is consistently applied across all T-2.4.1 documentation
# WHEN: Execute after SSR validation to verify design approach consistency
# PREREQUISITES: All 5 T-2.4.1 documentation files complete
# EXPECTED OUTCOME: Mobile-first approach documented and demonstrated consistently
# FAILURE HANDLING: If inconsistencies found, document which files need alignment
# T-2.4.1 SPECIFIC: Must verify mobile-first patterns in breakpoint definitions, guidelines, and examples

echo "=== T-2.4.1 MOBILE-FIRST METHODOLOGY VALIDATION ==="
echo "Validating mobile-first consistency across all T-2.4.1 documentation..."
echo ""

for file in design-system/docs/responsive/breakpoints/*.md; do
    echo "Checking mobile-first patterns in $(basename "$file"):"
    echo "  Mobile-first mentions:"
    grep -c -i "mobile.*first\|mobile-first" "$file" && echo "    ✓ Mobile-first documented" || echo "    ⚠ Mobile-first may be missing"
    echo "  Progressive enhancement mentions:"
    grep -c -i "progressive.*enhancement\|graceful.*degradation" "$file" && echo "    ✓ Progressive enhancement mentioned" || echo "    ⚠ Progressive enhancement may be missing"
    echo "  Smallest breakpoint first patterns:"
    grep -c "xs.*sm.*md.*lg" "$file" && echo "    ✓ Breakpoint progression documented" || echo "    ⚠ Breakpoint order may need review"
    echo ""
done

echo "=== MOBILE-FIRST METHODOLOGY VALIDATION COMPLETE ==="
```

### Validation
- [ ] All responsive patterns demonstrate Next.js 14 SSR compatibility
- [ ] SSR-safe hooks and client-side detection patterns documented
- [ ] Hydration considerations properly addressed in all examples
- [ ] Mobile-first methodology consistently applied across all 5 files

## Phase 5: T-2.4.1 Comprehensive Quality Validation

### Prerequisites (builds on Phase 4)
- All previous phases passed successfully
- Complete T-2.4.1 implementation ready for final validation

### Actions

#### Step 5.1: Execute Final Documentation Quality Assessment
```bash
# PURPOSE: Perform comprehensive quality check on all T-2.4.1 documentation following T-2.3.5 enhanced protocol
# WHEN: Execute as final validation step after all technical checks pass
# PREREQUISITES: All phases 0-4 completed successfully
# EXPECTED OUTCOME: All documentation meets T-2.3.5 quality standards and T-2.4.1 requirements
# FAILURE HANDLING: If quality issues found, document specific improvements needed
# T-2.4.1 SPECIFIC: Must validate 2,752 total lines meet professional documentation standards

echo "=== T-2.4.1 COMPREHENSIVE QUALITY VALIDATION ==="
echo "Executing final quality assessment for all T-2.4.1 documentation..."
echo ""

# Calculate total documentation lines
echo "Documentation scope validation:"
total_lines=0
for file in design-system/docs/responsive/breakpoints/*.md; do
    lines=$(wc -l < "$file")
    echo "  $(basename "$file"): $lines lines"
    total_lines=$((total_lines + lines))
done
echo "  Total: $total_lines lines"
echo "  Expected: ~2,752 lines"
echo ""

# Check for completeness indicators
echo "Completeness validation:"
echo "1. All sections have content (no TODO or placeholder text):"
! grep -r "TODO\|PLACEHOLDER\|TBD\|\[.*\]" design-system/docs/responsive/breakpoints/ && echo "  ✓ No placeholders found" || echo "  ⚠ Placeholders may exist"
echo ""

echo "2. Code examples are complete and functional:"
grep -c "```typescript" design-system/docs/responsive/breakpoints/*.md | awk -F: '{sum+=$2} END {print "  TypeScript examples: " sum " found"}'
grep -c "```tsx" design-system/docs/responsive/breakpoints/*.md | awk -F: '{sum+=$2} END {print "  TSX examples: " sum " found"}'
echo ""

echo "3. Cross-references are complete:"
grep -c "](../" design-system/docs/responsive/breakpoints/*.md | awk -F: '{sum+=$2} END {print "  Internal links: " sum " found"}'
echo ""

echo "=== COMPREHENSIVE QUALITY VALIDATION COMPLETE ==="
```

#### Step 5.2: Generate T-2.4.1 Testing Report
```bash
# PURPOSE: Generate comprehensive testing report summarizing all T-2.4.1 validation results
# WHEN: Execute as final step after all validations complete
# PREREQUISITES: All testing phases completed
# EXPECTED OUTCOME: Complete testing report generated with pass/fail status for each validation
# FAILURE HANDLING: Report generation failure indicates testing process issues
# T-2.4.1 SPECIFIC: Must document specific T-2.4.1 outcomes and any issues found

echo "=== T-2.4.1 TESTING REPORT GENERATION ==="
mkdir -p test/reports/T-2.4.1
cd test/reports/T-2.4.1

cat > T-2.4.1-testing-report.md << 'EOF'
# T-2.4.1: Breakpoint System Documentation - Testing Report

## Executive Summary
This report documents the comprehensive testing results for T-2.4.1: Breakpoint System Documentation implementation.

## Test Results Summary

### Phase 0: Environment Setup
- [ ] Environment setup completed
- [ ] T-2.4.1 files verified present
- [ ] Legacy reference access confirmed

### Phase 1: Legacy Accuracy Validation  
- [ ] Breakpoint definitions accuracy validated
- [ ] Container configuration accuracy validated
- [ ] Legacy reference citations verified

### Phase 2: TypeScript Compilation Validation
- [ ] TypeScript code extraction completed
- [ ] Strict mode compilation successful
- [ ] No type safety violations found

### Phase 3: Cross-Reference Integration Testing
- [ ] T-2.3.5 integration links functional
- [ ] Documentation structure matches proven pattern
- [ ] All cross-references resolve correctly

### Phase 4: Next.js 14 SSR Compatibility Testing
- [ ] SSR-safe patterns validated
- [ ] Mobile-first methodology confirmed consistent
- [ ] Hydration considerations addressed

### Phase 5: Comprehensive Quality Validation
- [ ] Documentation quality standards met
- [ ] All content complete and professional
- [ ] Testing objectives achieved

## Detailed Findings
[Results will be populated during test execution]

## Recommendations
[Specific recommendations based on test outcomes]

## Final Status
[ ] PASS - All T-2.4.1 requirements met
[ ] CONDITIONAL PASS - Minor issues identified but acceptable
[ ] FAIL - Critical issues require resolution

Generated: $(date)
EOF

echo "T-2.4.1 testing report template generated"
echo "Report location: test/reports/T-2.4.1/T-2.4.1-testing-report.md"
cd ../../..
echo "=== TESTING REPORT GENERATION COMPLETE ==="
```

### Validation
- [ ] Comprehensive quality assessment completed for all 2,752 lines of documentation
- [ ] No placeholders or incomplete sections found
- [ ] All code examples verified complete and functional
- [ ] Testing report generated with detailed findings
- [ ] Final pass/fail determination documented

### Final Deliverables
- Complete T-2.4.1 testing validation across all 5 documentation files
- Legacy accuracy verification against specific tailwind.config.js lines
- TypeScript strict mode compliance confirmation
- T-2.3.5 integration validation
- Next.js 14 SSR compatibility verification
- Comprehensive testing report with recommendations

## Testing Success Criteria

You shall consider T-2.4.1 testing successful when ALL of the following criteria are met:

1. **Legacy Accuracy**: 100% accuracy verified against `aplio-legacy/tailwind.config.js` lines 13-17 and 21-23
2. **TypeScript Compliance**: All code examples compile successfully with strict mode enabled
3. **Cross-Reference Integration**: All T-2.3.5 accessibility links functional and accessible
4. **SSR Compatibility**: All responsive patterns demonstrated as Next.js 14 SSR-safe
5. **Mobile-First Consistency**: Mobile-first methodology applied consistently across all 5 files
6. **Documentation Quality**: Professional documentation standards met across 2,752 total lines
7. **Structure Compliance**: 5-file pattern matches proven T-2.3.5 implementation exactly
8. **Testing Coverage**: All validation phases completed without critical failures

## Post-Testing Actions

Upon successful completion of all testing phases:

1. **Update active-task-unit-tests-2-enhanced.md**: Copy this enhanced test plan to replace the base template
2. **Generate final report**: Complete T-2.4.1-testing-report.md with all findings
3. **Document any issues**: Log any minor issues found for future improvement
4. **Confirm readiness**: Verify T-2.4.1 is ready for production use in design system
