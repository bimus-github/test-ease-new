import { ScoringType, Test } from "@/types/test";

interface HeaderProps {
  test: Test;
}

function Header(props: HeaderProps) {
  const { test } = props;
  
  const isRaschTest = test.scoring_type === ScoringType.RASCH_SCORING;
  const isRaschCalculated = test.isRaschCalculated ?? false;
  const showRasch = isRaschTest && isRaschCalculated;
  const isSatTest = test.scoring_type === ScoringType.SAT_SCORING;
  const isUzDtmTest = test.scoring_type === ScoringType.UZ_DTM;
  const isSimpleTest = test.scoring_type === ScoringType.SIMPLE_SCORING;

  return (
    <thead className="bg-neutral-50 text-xs dark:bg-neutral-900">
      <tr>
        <th className="px-3 py-2 font-medium text-neutral-600">#</th>
        <th className="px-3 py-2 font-medium text-neutral-600">
          Foydalanuvchi
        </th>
        <th className="px-3 py-2 font-medium text-neutral-600">
          Yuborilgan
        </th>
        <th className="px-3 py-2 font-medium text-neutral-600">
          To'g'ri javoblar
        </th>
        {showRasch && (
          <>
            <th className="px-3 py-2 font-medium text-neutral-600">
              Rasch T
            </th>
            <th className="px-3 py-2 font-medium text-neutral-600">
              Bahosi
            </th>
            <th className="px-3 py-2 font-medium text-neutral-600">
              Foizi
            </th>
          </>
        )}
        {isSatTest && (
          <th className="px-3 py-2 font-medium text-neutral-600">
            SAT bali
          </th>
        )}
        {isUzDtmTest && (
          <th className="px-3 py-2 font-medium text-neutral-600">
            UZ DTM bali
          </th>
        )}
        {isSimpleTest && (
          <th className="px-3 py-2 font-medium text-neutral-600">
            Ballar
          </th>
        )}
        <th className="px-3 py-2 font-medium text-neutral-600">Amal</th>
      </tr>
    </thead>
  );
}

export default Header;