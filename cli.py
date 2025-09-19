import argparse
import sys
from pathlib import Path
from converter import MarkdownConverter, ConversionConfig, OutputFormat, ValidationError

def main():
    parser = argparse.ArgumentParser(description='Convert Markdown to PDF/Word with image validation')
    parser.add_argument('files', nargs='+', help='Markdown files to convert')
    parser.add_argument('--format', choices=['pdf', 'docx', 'both'], 
                       default='both', help='Output format (default: both)')
    parser.add_argument('--output-dir', default='output', 
                       help='Output directory (default: output)')
    parser.add_argument('--pdf-engine', default='xelatex',
                       help='PDF engine for Pandoc (default: xelatex)')
    parser.add_argument('--reference-doc', 
                       help='Reference document for Word output')
    parser.add_argument('--dpi', type=int, default=300,
                       help='DPI for images (default: 300)')
    parser.add_argument('--no-validate', action='store_true',
                       help='Skip image validation')
    
    args = parser.parse_args()
    
    # Create configuration
    config = ConversionConfig(
        output_format=OutputFormat(args.format),
        output_dir=args.output_dir,
        pdf_engine=args.pdf_engine,
        reference_doc=args.reference_doc,
        dpi=args.dpi,
        validate_images=not args.no_validate
    )
    
    try:
        converter = MarkdownConverter(config)
        
        if len(args.files) == 1:
            results = converter.convert_file(args.files[0])
            print(f"Conversion successful:")
            for format_type, output_path in results.items():
                print(f"  {format_type.upper()}: {output_path}")
        else:
            results = converter.convert_multiple(args.files)
            print("Conversion results:")
            for file_path, file_results in results.items():
                print(f"\n{file_path}:")
                if 'error' in file_results:
                    print(f"  ERROR: {file_results['error']}")
                else:
                    for format_type, output_path in file_results.items():
                        print(f"  {format_type.upper()}: {output_path}")
    
    except ValidationError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()