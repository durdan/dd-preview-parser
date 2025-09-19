import argparse
import sys
from pathlib import Path
from converter import MarkdownConverter, ConversionConfig, OutputFormat, ValidationError

def main():
    parser = argparse.ArgumentParser(description='Convert Markdown to PDF/DOCX with image embedding')
    parser.add_argument('input', help='Input markdown file or directory')
    parser.add_argument('-o', '--output', default='output', help='Output directory')
    parser.add_argument('-f', '--format', choices=['pdf', 'docx', 'both'], 
                       default='both', help='Output format')
    parser.add_argument('--pdf-engine', default='xelatex', 
                       help='PDF engine for Pandoc (xelatex, pdflatex, lualatex)')
    parser.add_argument('--template', help='Pandoc template file')
    parser.add_argument('--css', help='CSS file for styling')
    parser.add_argument('--reference-doc', help='Reference document for Word styling')
    
    args = parser.parse_args()
    
    # Create configuration
    config = ConversionConfig(
        output_format=OutputFormat(args.format),
        output_dir=args.output,
        pdf_engine=args.pdf_engine,
        template=args.template,
        css_file=args.css,
        reference_doc=args.reference_doc
    )
    
    try:
        converter = MarkdownConverter(config)
        input_path = Path(args.input)
        
        if input_path.is_file():
            results = converter.convert_file(input_path)
            print(f"Successfully converted {input_path}")
            for format_type, output_file in results.items():
                print(f"  {format_type.upper()}: {output_file}")
        
        elif input_path.is_dir():
            results = converter.convert_directory(input_path)
            print(f"Processed {len(results)} files from {input_path}")
            for input_file, outputs in results.items():
                if "error" in outputs:
                    print(f"  ERROR {input_file}: {outputs['error']}")
                else:
                    print(f"  SUCCESS {input_file}:")
                    for format_type, output_file in outputs.items():
                        print(f"    {format_type.upper()}: {output_file}")
        
        else:
            print(f"Error: Input path not found: {input_path}")
            sys.exit(1)
    
    except ValidationError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()